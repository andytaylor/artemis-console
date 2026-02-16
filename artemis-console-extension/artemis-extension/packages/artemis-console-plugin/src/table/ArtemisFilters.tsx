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

import React, { useEffect, useRef, useState } from 'react';
import { Button, Select, SelectList, SelectOption, MenuToggleElement, MenuToggle, TextInput, ToolbarItem, Chip, ChipGroup, Modal, ModalVariant, Form, FormGroup, TextInputGroup, TextInputGroupMain, TextInputGroupUtilities, SelectOptionProps } from '@patternfly/react-core';
import { getFilterOpSymbol, Filter, TableFilters, SavedTableFilter, SAVED_FILTERS_KEY } from '../util/filter-util';
import { CreateSavedFilter } from './CreateSavedFilter';
import { auto } from '@patternfly/react-core/dist/esm/helpers/Popper/thirdparty/popper-core';
import { useSearchParams } from 'react-router-dom';
import { TimesIcon } from '@patternfly/react-icons';

export type ArtemisFiltersProps = {
  columns: { id: string; name: string; visible: boolean }[];
  operationOptions: { id: string; name: string }[];
  initialFilter: { column: string; operation: string; input: string };
  tableFilters: TableFilters
  onApplyFilter: (filter: { column: string; operation: string; input: string }) => void;
  onApplyFilters: (filters: TableFilters) => void;
};

export const ArtemisFilters: React.FC<ArtemisFiltersProps> = ({ columns, operationOptions, initialFilter, tableFilters, onApplyFilter, onApplyFilters }) => {
  const searchRef = useRef<HTMLInputElement>(null);

  const [filterColumn, setFilterColumn] = useState(
    columns.find(c => c.id === initialFilter.column)
  );
  const [filterOperation, setFilterOperation] = useState(
    operationOptions.find(o => o.id === initialFilter.operation)
  );
  const [columnOpen, setColumnOpen] = useState(false);
  const [operationOpen, setOperationOpen] = useState(false);

  const visibleColumns = columns.filter(c => c.visible);

  const [ searchParams, setSearchParams ] = useSearchParams();
  const view = searchParams.get('tab') || '';
  const initialSavedFilter: SavedTableFilter = {
      name: "",
      view: view,
      tableFilters: {
          searchFilters: [],
          sortOrder: "",
          sortColumn: ""
      }
  };

  const [ savedTableFilters, setSavedTableFilter ] = useState<SavedTableFilter[]>(() => {
  const storedSavedFilters = localStorage.getItem(SAVED_FILTERS_KEY);
    if (storedSavedFilters) {
      return JSON.parse(storedSavedFilters) as SavedTableFilter[];
    }
    return []; 
  });
  const [ currentSavedFilter, setCurrentSavedFilter ] = useState<SavedTableFilter>();

  const applyFilter = () => {
    const filterValue = searchRef.current?.value ?? "";
    if (filterOperation && filterColumn) {
      const copyOfFilters = [...tableFilters.searchFilters];
      copyOfFilters.push({
        field: filterColumn?.id || '',
        operation: filterOperation?.id || '',
        value: filterValue
      });
      const newArtemisFilters: TableFilters = {
        searchFilters: copyOfFilters,
        sortOrder: tableFilters.sortOrder,
        sortColumn: tableFilters.sortColumn
      };
      onApplyFilters(newArtemisFilters);
    }
  }

 
  const initialSavedFilterSelectOptions: SelectOptionProps[] = [
  ];

  savedTableFilters.map((filter) => {
    initialSavedFilterSelectOptions.push({ value: filter.name, children: filter.name });
  })

  const [isSavedFilterOpen, setIsSavedFilterOpen] = useState(false);
  const [selectedSavedFilter, setSelectedSavedFilter] = useState<string>('');
  const [savedFilterInputValue, setSavedFilterInputValue] = useState<string>('');
  const [savedFilterFilterValue, setSavedFilterFilterValue] = useState<string>('');
  const [selectSavedFilterOptions, setSelectSavedFilterOptions] = useState<SelectOptionProps[]>(initialSavedFilterSelectOptions);
  const [focusedSavedFilterItemIndex, setFocusedSavedFilterItemIndex] = useState<number | null>(null);
  const [activeSavedFilterItemId, setActiveSavedFilterItemId] = useState<string | null>(null);
  const savedFilterTextInputRef = useRef<HTMLInputElement>(undefined);

  const NO_RESULTS = 'no results';

  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = initialSavedFilterSelectOptions;

    // Filter menu items based on the text input value when one exists
    if (savedFilterFilterValue) {
      newSelectOptions = initialSavedFilterSelectOptions.filter((menuItem) =>
        String(menuItem.children).toLowerCase().includes(savedFilterFilterValue.toLowerCase())
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          { isAriaDisabled: true, children: `No results found for "${savedFilterFilterValue}"`, value: NO_RESULTS }
        ];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isSavedFilterOpen) {
        setIsSavedFilterOpen(true);
      }
    }

    setSelectSavedFilterOptions(newSelectOptions);
  }, [savedFilterFilterValue, savedTableFilters]);

  useEffect(() => {
    if(currentSavedFilter) {
      const artemisFilters: TableFilters = {
        searchFilters: [...currentSavedFilter?.tableFilters.searchFilters],
        sortOrder: currentSavedFilter.tableFilters.sortOrder,
        sortColumn: currentSavedFilter.tableFilters.sortColumn
      }
      //setArtemisFilters(artemisFilters);
      onApplyFilters(artemisFilters);
  } else {
    onApplyFilters(initialSavedFilter.tableFilters)
  } }, [currentSavedFilter]);

  const createItemId = (value: any) => `select-typeahead-${value.replace(' ', '-')}`;

  const setSavedFilterActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedSavedFilterItemIndex(itemIndex);
    const focusedItem = selectSavedFilterOptions[itemIndex];
    setActiveSavedFilterItemId(createItemId(focusedItem.value));
  };

  const resetSavedFilterActiveAndFocusedItem = () => {
    setFocusedSavedFilterItemIndex(null);
    setActiveSavedFilterItemId(null);
    setCurrentSavedFilter(undefined);
    //setArtemisFilters(initialArtemisFilters);
  };

  const closeSavedFilterMenu = () => {
    setIsSavedFilterOpen(false);
    resetSavedFilterActiveAndFocusedItem();
  };

  const onSavedFilterInputClick = () => {
    if (!isSavedFilterOpen) {
      setIsSavedFilterOpen(true);
    } else if (!savedFilterInputValue) {
      closeSavedFilterMenu();
    }
  };

  const savedFilterSelectOption = (value: string | number, content: string | number) => {
    // eslint-disable-next-line no-console
    console.log('selected', content);

    setSavedFilterInputValue(String(content));
    setSavedFilterFilterValue('');
    setSelectedSavedFilter(String(value));

    closeSavedFilterMenu();
    const savedFilter = savedTableFilters.find((filter) => filter.name === value);
    setCurrentSavedFilter(savedFilter);
  };

  const onSavedFilterSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (value && value !== NO_RESULTS) {
      const optionText = selectSavedFilterOptions.find((option) => option.value === value)?.children;
      savedFilterSelectOption(value, optionText as string);
    }
  };

  const onSavedFilterTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setSavedFilterInputValue(value);
    setSavedFilterFilterValue(value);

    resetSavedFilterActiveAndFocusedItem();

    if (value !== selectedSavedFilter) {
      setSelectedSavedFilter('');
    }
  };

  const handleSavedFilterMenuArrowKeys = (key: string) => {
    let indexToFocus = 0;

    if (!isSavedFilterOpen) {
      setIsSavedFilterOpen(true);
    }

    if (selectSavedFilterOptions.every((option) => option.isDisabled)) {
      return;
    }

    if (key === 'ArrowUp') {
      // When no index is set or at the first index, focus to the last, otherwise decrement focus index
      if (focusedSavedFilterItemIndex === null || focusedSavedFilterItemIndex === 0) {
        indexToFocus = selectSavedFilterOptions.length - 1;
      } else {
        indexToFocus = focusedSavedFilterItemIndex - 1;
      }

      // Skip disabled options
      while (selectSavedFilterOptions[indexToFocus].isDisabled) {
        indexToFocus--;
        if (indexToFocus === -1) {
          indexToFocus = selectSavedFilterOptions.length - 1;
        }
      }
    }

    if (key === 'ArrowDown') {
      // When no index is set or at the last index, focus to the first, otherwise increment focus index
      if (focusedSavedFilterItemIndex === null || focusedSavedFilterItemIndex === selectSavedFilterOptions.length - 1) {
        indexToFocus = 0;
      } else {
        indexToFocus = focusedSavedFilterItemIndex + 1;
      }

      // Skip disabled options
      while (selectSavedFilterOptions[indexToFocus].isDisabled) {
        indexToFocus++;
        if (indexToFocus === selectSavedFilterOptions.length) {
          indexToFocus = 0;
        }
      }
    }

    setSavedFilterActiveAndFocusedItem(indexToFocus);
  };

  const onSavedFilterInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const focusedItem = focusedSavedFilterItemIndex !== null ? selectSavedFilterOptions[focusedSavedFilterItemIndex] : null;

    switch (event.key) {
      case 'Enter':
        if (isSavedFilterOpen && focusedItem && focusedItem.value !== NO_RESULTS && !focusedItem.isAriaDisabled) {
          savedFilterSelectOption(focusedItem.value, focusedItem.children as string);
        }

        if (!isSavedFilterOpen) {
          setIsSavedFilterOpen(true);
        }

        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleSavedFilterMenuArrowKeys(event.key);
        break;
    }
  };

  const onSavedFilterToggleClick = () => {
    setIsSavedFilterOpen(!isSavedFilterOpen);
    savedFilterTextInputRef?.current?.focus();
  };

  const onSavedFilterClearButtonClick = () => {
    setSelectedSavedFilter('');
    setSavedFilterInputValue('');
    setSavedFilterFilterValue('');
    resetSavedFilterActiveAndFocusedItem();
    savedFilterTextInputRef?.current?.focus();
  };

  const getSavedFilterSelectionsForView = () => {
    const viewableFilters = savedTableFilters.filter((filter) => filter.view === view);
    const ret =  selectSavedFilterOptions.filter(filter => containsViewableFilter(viewableFilters, filter));
    return ret;
  }

  const containsViewableFilter = (viewableFilters: SavedTableFilter[], filter: SelectOptionProps) => {
    const isSame = viewableFilters.some((viewableFilter) => viewableFilter.name === filter.value);
    return isSame;
  }

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      aria-label="Typeahead menu toggle"
      onClick={onSavedFilterToggleClick}
      isExpanded={isSavedFilterOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={savedFilterInputValue}
          onClick={onSavedFilterInputClick}
          onChange={onSavedFilterTextInputChange}
          onKeyDown={onSavedFilterInputKeyDown}
          id="typeahead-select-input"
          autoComplete="off"
          innerRef={savedFilterTextInputRef}
          placeholder="Select a Saved Filter"
          {...(activeSavedFilterItemId && { 'aria-activedescendant': activeSavedFilterItemId })}
          role="combobox"
          isExpanded={isSavedFilterOpen}
          aria-controls="select-typeahead-listbox"
        />

        <TextInputGroupUtilities {...(!savedFilterInputValue ? { style: { display: 'none' } } : {})}>
          <Button variant="plain" onClick={onSavedFilterClearButtonClick} aria-label="Clear input value" icon={<TimesIcon />} />
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <>
      <ToolbarItem variant="search-filter" key='column-id-select'>
        <Select
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle isFullWidth role='menu' ref={toggleRef} onClick={() => setColumnOpen(prev => !prev)}>
              {filterColumn?.name}
            </MenuToggle>
          )}
          aria-label="Select Input"
          isOpen={columnOpen}
          onOpenChange={setColumnOpen}
          onSelect={(_e, selection) => {
            const selectedColumn = columns.find(c => c.name === selection);
            setFilterColumn(selectedColumn);
            setColumnOpen(false); }}
          selected={filterColumn?.name}
        >
          <SelectList>
            {visibleColumns.map(column => (
              <SelectOption key={column.id} value={column.name}>{column.name}</SelectOption>
            ))}
          </SelectList>
        </Select>
      </ToolbarItem>
      <ToolbarItem variant="search-filter" key="filter-type">
        <Select
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle isFullWidth role='menu' ref={toggleRef} onClick={() => setOperationOpen(prev => !prev)}>
              {filterOperation?.name}
            </MenuToggle>
          )}
          aria-label="Select Input"
          isOpen={operationOpen}
          onOpenChange={setOperationOpen}
          onSelect={(_e, selection) => {
            const selectedOperation = operationOptions.find(o => o.name === selection);
            setFilterOperation(selectedOperation);
            setOperationOpen(false); }}
          selected={filterOperation?.name}
        >
          <SelectList>
            {operationOptions.map(operation => (
              <SelectOption key={operation.id} value={operation.name}>{operation.name}</SelectOption>
            ))}
          </SelectList>
        </Select>
      </ToolbarItem>
       <ToolbarItem variant="search-filter" key="search=text">
        <TextInput
          aria-label="Search"
          ref={searchRef}
          defaultValue={initialFilter.input}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              applyFilter();
            }
          }
        }
        />
      </ToolbarItem>
      <ToolbarItem>
        <Button onClick={() => applyFilter()}>Add</Button>
      </ToolbarItem>
      <ToolbarItem variant="separator"></ToolbarItem>
      <ToolbarItem>
        <Select
          id="typeahead-select"
          isOpen={isSavedFilterOpen}
          selected={selectedSavedFilter}
          onSelect={onSavedFilterSelect}
          onOpenChange={(isOpen) => {
            !isOpen && closeSavedFilterMenu();
          }}
          toggle={toggle}
          variant="typeahead"
        >
      <SelectList id="select-typeahead-listbox">
        {getSavedFilterSelectionsForView().map((option, index) => (
          <SelectOption
            key={option.value || option.children}
            isFocused={focusedSavedFilterItemIndex === index}
            className={option.className}
            id={createItemId(option.value)}
            {...option}
            ref={null}
          />
        ))}
      </SelectList>
    </Select>
      </ToolbarItem>  
      
      <ToolbarItem variant="separator"></ToolbarItem>
    </>
  );
};