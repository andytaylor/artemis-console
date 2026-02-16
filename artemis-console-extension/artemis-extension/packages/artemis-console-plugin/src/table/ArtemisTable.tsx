/*
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useEffect, useState } from 'react'
import {Link, useSearchParams } from 'react-router-dom'
import {
  Button,
  DataList,
  DataListCheck,
  DataListItem,
  DataListItemRow,
  DataListCell,
  DataListItemCells,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Modal,
  Pagination,
  PaginationVariant,
  Text,
  TextContent,
  Label,
  FormGroup,
  TextInput,
  Form
} from '@patternfly/react-core';
import { SortAmountDownIcon } from '@patternfly/react-icons/dist/esm/icons/sort-amount-down-icon';
import { Thead, Tr, Th, Tbody, Td, IAction, ActionsColumn, Table, InnerScrollContainer } from '@patternfly/react-table';
import { artemisPreferencesService } from '../artemis-preferences-service';
import {
  OptionsMenu,
  OptionsMenuItem,
  OptionsMenuItemGroup,
  OptionsMenuSeparator,
  OptionsMenuToggle
} from '@patternfly/react-core/deprecated'

import { ArtemisFilters } from './ArtemisFilters';
import {Simulate} from "react-dom/test-utils";
import loadedData = Simulate.loadedData;
import { TableFilters, EMPTY_FILTER, Filter, getFilterOpSymbol, SavedTableFilter, SAVED_FILTERS_KEY  } from '../util/filter-util';
import { HelpIcon } from '@patternfly/react-icons';

export type Column = {
  id: string
  name: string
  visible: boolean
  sortable: boolean
  filterable: boolean
  filter?: Function
  filterTab?: number
  link?: Function
}

export enum SortDirection {
  ASCENDING = 'asc',
  DESCENDING = 'desc'
}

export type ActiveSort = {
  id: string
  order: SortDirection
}

export type ToolbarAction = {
  name: string
  action: Function
}

export type TableData = {
  allColumns: Column[],
  getData: Function,
  getDataFiltered?: Function,
  getRowActions?: Function,
  toolbarActions?: ToolbarAction[],
  loadData?: number,
  storageColumnLocation?: string
  navigate?: Function
  filter?: Filter
  showDetail?: Function
}

export const ArtemisTable: React.FunctionComponent<TableData> = broker => {

const operationOptions = [
    { id: 'CONTAINS', name: 'Contains' },
    { id: 'NOT_CONTAINS', name: 'Does Not Contain' },
    { id: 'EQUALS', name: 'Equals' },
    { id: 'GREATER_THAN', name: 'Greater Than' },
    { id: 'LESS_THAN', name: 'Less Than' }
  ]
  
  const initialActiveSort = () => {
    if (broker.storageColumnLocation && sessionStorage.getItem(broker.storageColumnLocation + '.activesort')) {
      return JSON.parse(sessionStorage.getItem(broker.storageColumnLocation + '.activesort') as string);
    }
    return {
      id: broker.allColumns[0].id,
      order: SortDirection.ASCENDING
    };
  }
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('tab') || '';
  const [rows, setRows] = useState([])
  const [resultsSize, setresultsSize] = useState(0)
  const [columnsLoaded, setColumnsLoaded] = useState(false);
  
  const [columns, setColumns] = useState(broker.allColumns);
  const [activeSort, setActiveSort] = useState(initialActiveSort);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [isCompact, setIsCompact] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [perPageOption, setPerPageOption] = useState(1);
  const pageSize = artemisPreferencesService.loadTablePageSize(broker.storageColumnLocation);

  const rootElement = document.getElementById('root') as HTMLElement;
  const popperProps = {
    position: 'right' as const,
    appendTo: rootElement,
  };

  const visibleColumns = columns.filter((column) => column.visible);

  const initialFilter = () =>  {
    if (broker.storageColumnLocation && sessionStorage.getItem(broker.storageColumnLocation + '.filter')) {
      return JSON.parse(sessionStorage.getItem(broker.storageColumnLocation + '.filter') as string);
    }
    return {
      column: columns[1].id,
      operation: operationOptions[0].id,
      input: ''
    }
  }

  if (broker.filter) {
    sessionStorage.setItem(broker.storageColumnLocation + '.filter', JSON.stringify(broker.filter));
  }

  const [filter, setFilter] = useState(() => broker.filter !== undefined ? broker.filter : initialFilter());

  const initialTableFilters = () => {
    const activeTableFilters = searchParams.get('artemisFilters') || undefined;
    if(activeTableFilters) {
      const tableFilters: TableFilters = JSON.parse(activeTableFilters);
      return tableFilters;
    }
    const filter: TableFilters = EMPTY_FILTER;
    filter.sortColumn = activeSort.id;
    filter.sortOrder = activeSort.order;;
    return filter;
  }
  const [tableFilters, setTableFilters] = useState(initialTableFilters);

  const listData = async () => {
    if(broker.getDataFiltered) {
      const data = await broker.getDataFiltered(page, perPage, tableFilters);
      setRows(data.data);
      setresultsSize(data.count);
      return;
    }
    const data = await broker.getData(page, perPage, activeSort, filter);
    setRows(data.data);
    setresultsSize(data.count);
  };

  useEffect(() => {
    if (!columnsLoaded && broker.storageColumnLocation) {
      const updatedColumns: Column[] = artemisPreferencesService.loadColumnPreferences(broker.storageColumnLocation, broker.allColumns);
      if (pageSize == -1) {
        setIsCompact(true);
      }
      setColumns(updatedColumns);
      setColumnsLoaded(true);
    }
  }, [columnsLoaded]);

  useEffect(() => {
    listData();
  }, [page, perPage, activeSort, filter, tableFilters, broker.loadData]);

  const handleModalToggle = () => {
    setIsModalOpen(!isModalOpen);
  };

  const onSave = () => {
    setIsModalOpen(!isModalOpen);

    if (broker.storageColumnLocation) {
      artemisPreferencesService.saveColumnPreferences(broker.storageColumnLocation, columns);
    }
  };

  const selectAllColumns = () => {
    const updatedColumns = [...columns]
    updatedColumns.map((column) => {
      column.visible = true;
      return true;
    })
    setColumns(updatedColumns);
  };

  const unselectAllColumns = () => {
    const updatedColumns = [...columns]
    updatedColumns.map((column) => {
      column.visible = false;
      return false;
    })
    setColumns(updatedColumns);
  };

  const updateColumnStatus = (index: number, column: Column) => {
    const updatedColumns = [...columns];
    updatedColumns[index].visible = !columns[index].visible;
    setColumns(updatedColumns);
  }

  const updateActiveSort = (id: string, order: SortDirection) => {
    const updatedActiveSort: ActiveSort = {
      id: id,
      order: order
    };
    const filter: TableFilters = {
      searchFilters: [...tableFilters.searchFilters],
      sortOrder: updatedActiveSort.order,
      sortColumn: updatedActiveSort.id
    }
    setTableFilters(filter);
    setActiveSort(updatedActiveSort);
    sessionStorage.setItem(broker.storageColumnLocation + ".activesort",JSON.stringify(updatedActiveSort));
  }

  const getRowActions = (row: never): IAction[] => {
    if (broker.getRowActions) {
      return broker.getRowActions(row);
    }
    return [];
  };

  const handleSetPage = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageSelect = (_event: React.MouseEvent | React.KeyboardEvent | MouseEvent, newPerPage: number) => {
    setPerPageOption(newPerPage);
    if(broker.storageColumnLocation) {
      artemisPreferencesService.saveTablePageSize(broker.storageColumnLocation, newPerPage)
    }
    if (newPerPage === -1) {
      setIsCompact(true);
      setPerPage(resultsSize);
    } else {
      setIsCompact(false);
      setPerPage(newPerPage);
    }
    setPage(1);
  };

  const getKeyByValue = (producer: never, columnName: string) => {
    return producer[columnName];
  }

  const handleClick = (column: Column, row: any) => () => {
    if (column.filter) {
      const filter = column.filter(row);
      if (broker.navigate) {
        broker.navigate(column.filterTab, filter);
      }
    } else if (column.link) {
      column.link(row);
    }
  };

  const pageSizeOptions = [
    { title: '10 per page', value: 10 },
    { title: '20 per page', value: 20 },
    { title: '50 per page', value: 50 },
    { title: '100 per page', value: 100 },
    { title: 'All items', value: -1 },
  ];

  const deleteTableFilter = (id: string) => {
    const copyOfFilters = [...tableFilters.searchFilters];
    const filteredCopy = copyOfFilters.filter((artemisFilter: Filter) => artemisFilter.field + artemisFilter.operation + artemisFilter.value !== id);
    const newArtemisFilters: TableFilters = {
      searchFilters: filteredCopy,
      sortOrder: tableFilters.sortOrder,
      sortColumn: tableFilters.sortColumn
    };
    setTableFilters(newArtemisFilters);
  };

  const clearTableFilter = () => {
    const newTableFilters: TableFilters = {
      searchFilters: [],
      sortOrder: '',
      sortColumn: ''
    };
    setTableFilters(newTableFilters);
  };

  const [isSaveFilterModalOpen, setIsSaveFilterModalOpen] = React.useState(false);

  const handleSaveFilterModalToggle = (_event: KeyboardEvent | React.MouseEvent) => {
    setIsSaveFilterModalOpen(!isSaveFilterModalOpen);
  };

  const [tableFilterName, setTableFilterName] = React.useState('');

  const handleTableFilterNameChange = (_event: any, name: string) => {
    setTableFilterName(name);
  };

  const initialSavedFilter: SavedTableFilter = {
      name: "",
      view: view,
      tableFilters: {
          searchFilters: [],
          sortOrder: "",
          sortColumn: ""
      }
  };

  const saveTableFilters = () => {
    console.log(tableFilters)
    const savedTableFilter: SavedTableFilter = {
      name: tableFilterName,
      view: view,
      tableFilters: tableFilters
    }
    const storedSavedFilters = localStorage.getItem(SAVED_FILTERS_KEY);
    if (storedSavedFilters) {
      const savedTableFilters: SavedTableFilter[] = JSON.parse(storedSavedFilters) as SavedTableFilter[];
      savedTableFilters.push(savedTableFilter);
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedTableFilters));
    } else {
      const savedTableFilters: SavedTableFilter[] = [savedTableFilter];
      localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedTableFilters));
    }
    setIsSaveFilterModalOpen(false);
  }

  const hasSearchFilters = () => {
    return tableFilters.searchFilters.length > 0;
  }

  const renderPagination = (variant: PaginationVariant | undefined) => (
    <Pagination
      itemCount={resultsSize}
      page={page}
      perPage={perPageOption}
      onSetPage={handleSetPage}
      onPerPageSelect={handlePerPageSelect}
      isCompact={isCompact}
      perPageOptions={pageSizeOptions}
      variant={variant}
      titles={{
        paginationAriaLabel: `${variant} pagination`,
        perPageSuffix: ''
      }}
    />
  );
  const renderModal = () => {
    return (
      <Modal
        title="Manage columns"
        isOpen={isModalOpen}
        variant="small"
        description={
          <TextContent>
            <Text>Selected categories are displayed in the table.</Text>
            <Button isInline onClick={selectAllColumns} variant="link">
              Select all
            </Button>{ ' | ' }
            <Button isInline onClick={unselectAllColumns} variant="link">
              Unselect all
            </Button>
          </TextContent>
        }
        onClose={handleModalToggle}
        actions={[
          <Button id='columns-save-button' key="save" variant="primary" onClick={onSave}>
            Save
          </Button>,
          <Button key="close" variant="secondary" onClick={handleModalToggle}>
            Cancel
          </Button>
        ]}
      >
        <DataList aria-label="Table column management" id="table-column-management" isCompact>
          {columns.map((column, id) => (
            <DataListItem key={`table-column-management-${column.id}`} aria-labelledby={`table-column-management-${column.id}`}>
              <DataListItemRow>
                <DataListCheck
                  aria-labelledby={`table-column-management-item-${column.id}`}
                  checked={column.visible}
                  name={`check-${column.id}`}
                  id={`check-${column.id}`}
                  onChange={checked => updateColumnStatus(id, column)}
                />
                <DataListItemCells
                  dataListCells={[
                    <DataListCell id={`table-column-management-item-${column.id}`} key={`table-column-management-item-${column.id}`}>
                      <label htmlFor={`check-${column.id}`}>{column.name}</label>
                    </DataListCell>
                  ]}
                />
              </DataListItemRow>
            </DataListItem>
          ))}
        </DataList>
      </Modal>
    );
  };

  return (
    <React.Fragment>

      <Toolbar id="toolbar">
        <ToolbarContent>
          <ToolbarItem key='address-sort'>
            <OptionsMenu
              id="options-menu-multiple-options-example"
              menuItems={[
                <OptionsMenuItemGroup key="sort-columns" aria-label="Sort column">
                  {Object.values(broker.allColumns).filter((element) => element.visible).map((column, columnIndex) => (
                    <OptionsMenuItem
                      key={column.id}
                      isSelected={activeSort.id === column.id}
                      onSelect={() => {
                        updateActiveSort(column.id, activeSort.order)
                      }}
                    >
                      {column.name}
                    </OptionsMenuItem>
                  ))}
                </OptionsMenuItemGroup>,
                <OptionsMenuSeparator key="separator" />,
                <OptionsMenuItemGroup key="sort-direction" aria-label="Sort direction">
                  <OptionsMenuItem
                    onSelect={() => updateActiveSort(activeSort.id, SortDirection.ASCENDING)}
                    isSelected={activeSort.order === SortDirection.ASCENDING}
                    id="ascending"
                    key="ascending"
                  >
                    Ascending
                  </OptionsMenuItem>
                  <OptionsMenuItem
                    onSelect={() => updateActiveSort(activeSort.id, SortDirection.DESCENDING)}
                    isSelected={activeSort.order === SortDirection.DESCENDING}
                    id="descending"
                    key="descending"
                  >
                    Descending
                  </OptionsMenuItem>
                </OptionsMenuItemGroup>
              ]}
              isOpen={isSortDropdownOpen}
              toggle={
                <OptionsMenuToggle
                  hideCaret
                  onToggle={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  toggleTemplate={<SortAmountDownIcon />}
                />
              }
              isPlain
              isGrouped
            />
          </ToolbarItem>

          <ArtemisFilters
            columns={columns}
            operationOptions={operationOptions}
            initialFilter={filter}
            tableFilters={tableFilters}
            onApplyFilter={(f) => {
              setPage(1);
              setFilter(f);
              if (broker.storageColumnLocation) {
                sessionStorage.setItem(broker.storageColumnLocation + '.filter', JSON.stringify(f));
              }
            } } 
            onApplyFilters={function (filters: TableFilters) {
                  setPage(1);
                  setTableFilters(filters);
            } }/>

          <ToolbarItem key="column-select">
            <Button variant='link' onClick={handleModalToggle}>Manage Columns</Button>
          </ToolbarItem>
          {
            broker.toolbarActions?.map(action => (
              <ToolbarItem key={"toolbar-action-" + action.name}>
                <Button variant='link' onClick={() => action.action()}>{action.name}</Button>
              </ToolbarItem>))
          }
        </ToolbarContent>
      </Toolbar>
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem>
              {tableFilters.searchFilters.map((filter) => (
                <><Label onClose={() => deleteTableFilter(filter.field + filter.operation + filter.value)}>{filter.field + getFilterOpSymbol(filter.operation) + filter.value}</Label>{' '}</>
              ))}
        </ToolbarItem>
        {hasSearchFilters() && 
          <ToolbarItem>
            <Button variant='link' onClick={() => clearTableFilter()}>Clear all Filters</Button>
          </ToolbarItem>
        }
        {hasSearchFilters() && 
          <ToolbarItem>
            <Button variant='primary' onClick={handleSaveFilterModalToggle}>Save</Button>
          </ToolbarItem>
        }
        </ToolbarContent>
      </Toolbar>

      <InnerScrollContainer>
      <Table variant="compact" aria-label="Data Table" id='data-table'>
      <Thead>
        <Tr>
          {visibleColumns.map((column, id) => {

            const isSorted = column.id === activeSort.id;
            const direction = isSorted ? activeSort.order : undefined;
            const nextDirection =
              isSorted && activeSort.order === SortDirection.ASCENDING
                ? SortDirection.DESCENDING
                : SortDirection.ASCENDING;
            return (
              <Th
                key={id}
                sort={{
                  sortBy: {
                    index: id,
                    direction: direction === SortDirection.ASCENDING ? 'asc' : 'desc'
                  },
                  onSort: () => updateActiveSort(column.id, nextDirection),
                  columnIndex: id
                }}
              >{column.name}</Th>
            );
          })}
        </Tr>
      </Thead>
        <Tbody>
          {rows.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              {visibleColumns.map((column, id) => {
                const key = getKeyByValue(row, column.id)
                if(column.filter || column.link) {
                  return <Td key={id}><Link to="" onClick={handleClick(column, row)}>{key}</Link></Td>
                } else {
                  return <Td key={id}>{key}</Td>
                }
              })}
              <Td isActionCell>
                <ActionsColumn
                  items={getRowActions(row)}
                  popperProps={popperProps}
                />
              </Td>
          </Tr>
          ))}
        </Tbody>
      </Table>
      </InnerScrollContainer>
      {renderPagination(PaginationVariant.bottom)}
      {renderModal()}
      <Modal
        title="Save Filter"
        isOpen={isSaveFilterModalOpen}
        onClose={handleSaveFilterModalToggle}
        actions={[
          <Button key="save" variant="primary" onClick={saveTableFilters}>
            Confirm
          </Button>,
          <Button key="cancel" variant="link" onClick={handleSaveFilterModalToggle}>
            Cancel
          </Button>
        ]}
        ouiaId="SaveFilter"
      >
        <Form>
          <FormGroup
          label="Filter Name"
          isRequired
          fieldId="simple-form-name-01"
          >
            <TextInput
              isRequired
              type="text"
              id="simple-form-name-01"
              name="simple-form-name-01"
              aria-describedby="simple-form-name-01-helper"
              value={tableFilterName}
              onChange={handleTableFilterNameChange}
            />
          </FormGroup>
        </Form>
      </Modal>
    </React.Fragment>
  );
};