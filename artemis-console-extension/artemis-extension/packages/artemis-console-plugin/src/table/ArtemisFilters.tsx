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
import { getFilterOpSymbol, Filter, ArtemisFilters as TheArtemisFilters, QuickFilter, QUICK_FILTERS_KEY } from '../util/filter-util';
import { CreateQuickFilter } from './CreateQuickFilter';
import { auto } from '@patternfly/react-core/dist/esm/helpers/Popper/thirdparty/popper-core';
import { useSearchParams } from 'react-router-dom';
import { TimesIcon } from '@patternfly/react-icons';

export type ArtemisFiltersProps = {
  columns: { id: string; name: string; visible: boolean }[];
  operationOptions: { id: string; name: string }[];
  initialFilter: { column: string; operation: string; input: string };
  artemisFilters: TheArtemisFilters
  onApplyFilter: (filter: { column: string; operation: string; input: string }) => void;
  onApplyFilters: (filters: TheArtemisFilters) => void;
};

export const ArtemisFilters: React.FC<ArtemisFiltersProps> = ({ columns, operationOptions, initialFilter, artemisFilters, onApplyFilter, onApplyFilters }) => {
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
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [ searchParams, setSearchParams ] = useSearchParams();
  const view = searchParams.get('tab') || '';
  const initialQuickFilter: QuickFilter = {
      name: "",
      view: view,
      artemisFilter: {
          searchFilters: [],
          sortOrder: "",
          sortColumn: ""
      }
  };

  const [ quickFilter, setQuickFilter ] = useState<QuickFilter>(initialQuickFilter);
  const [ quickFilters, setQuickFilters ] = useState<QuickFilter[]>(() => {
  const storedQuickFilters = localStorage.getItem(QUICK_FILTERS_KEY);
    if (storedQuickFilters) {
      return JSON.parse(storedQuickFilters) as QuickFilter[];
    }
    return []; 
  });
  const [ currentQuickFilter, setCurrentQuickFilter ] = useState<QuickFilter>();

  const applyFilter = () => {
    const filterValue = searchRef.current?.value ?? "";
    if (filterOperation && filterColumn) {
      const copyOfFilters = [...artemisFilters.searchFilters];
      copyOfFilters.push({
        field: filterColumn?.id || '',
        operation: filterOperation?.id || '',
        value: filterValue
      });
      const newArtemisFilters: TheArtemisFilters = {
        searchFilters: copyOfFilters,
        sortOrder: artemisFilters.sortOrder,
        sortColumn: artemisFilters.sortColumn
      };
      //setArtemisFilters(newArtemisFilters);
      onApplyFilters(newArtemisFilters);
    }
  }

  const deleteArtemisFilter = (id: string) => {
    const copyOfFilters = [...artemisFilters.searchFilters];
    const filteredCopy = copyOfFilters.filter((artemisFilter: Filter) => artemisFilter.field + artemisFilter.operation + artemisFilter.value !== id);
    const newArtemisFilters: TheArtemisFilters = {
      searchFilters: filteredCopy,
      sortOrder: artemisFilters.sortOrder,
      sortColumn: artemisFilters.sortColumn
    };
    //setArtemisFilters(newArtemisFilters);
    onApplyFilters(newArtemisFilters);
  };

  const addQuickFilter = () => {
    console.log(quickFilter)
    const quickFiltersCopy = [...quickFilters];
    quickFiltersCopy.push(quickFilter);
    setQuickFilters(quickFiltersCopy);
    const quickFilterOptions: SelectOptionProps[] = [...selectQuickFilterOptions]
    quickFilterOptions.push({value: quickFilter.name, label: quickFilter.name});
    setSelectQuickFilterOptions(quickFilterOptions);
    localStorage.setItem(QUICK_FILTERS_KEY, JSON.stringify(quickFiltersCopy));
  }

 
  const initialQuickFilterSelectOptions: SelectOptionProps[] = [
  ];

  quickFilters.map((filter) => {
    initialQuickFilterSelectOptions.push({ value: filter.name, children: filter.name });
  })

  const [isQuickFilterOpen, setIsQuickFilterOpen] = useState(false);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('');
  const [quickFilterInputValue, setQuickFilterInputValue] = useState<string>('');
  const [quickFilterFilterValue, setQuickFilterFilterValue] = useState<string>('');
  const [selectQuickFilterOptions, setSelectQuickFilterOptions] = useState<SelectOptionProps[]>(initialQuickFilterSelectOptions);
  const [focusedQuickFilterItemIndex, setFocusedQuickFilterItemIndex] = useState<number | null>(null);
  const [activeQuickFilterItemId, setActiveQuickFilterItemId] = useState<string | null>(null);
  const quickFilterTextInputRef = useRef<HTMLInputElement>(undefined);

  const NO_RESULTS = 'no results';

  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = initialQuickFilterSelectOptions;

    // Filter menu items based on the text input value when one exists
    if (quickFilterFilterValue) {
      newSelectOptions = initialQuickFilterSelectOptions.filter((menuItem) =>
        String(menuItem.children).toLowerCase().includes(quickFilterFilterValue.toLowerCase())
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          { isAriaDisabled: true, children: `No results found for "${quickFilterFilterValue}"`, value: NO_RESULTS }
        ];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isQuickFilterOpen) {
        setIsQuickFilterOpen(true);
      }
    }

    setSelectQuickFilterOptions(newSelectOptions);
  }, [quickFilterFilterValue, quickFilters]);

  useEffect(() => {
    if(currentQuickFilter) {
      const artemisFilters: TheArtemisFilters = {
        searchFilters: [...currentQuickFilter?.artemisFilter.searchFilters],
        sortOrder: currentQuickFilter.artemisFilter.sortOrder,
        sortColumn: currentQuickFilter.artemisFilter.sortColumn
      }
      //setArtemisFilters(artemisFilters);
      onApplyFilters(artemisFilters);
  } }, [currentQuickFilter]);

  const createItemId = (value: any) => `select-typeahead-${value.replace(' ', '-')}`;

  const setQuickFilterActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedQuickFilterItemIndex(itemIndex);
    const focusedItem = selectQuickFilterOptions[itemIndex];
    setActiveQuickFilterItemId(createItemId(focusedItem.value));
  };

  const resetQuickFilterActiveAndFocusedItem = () => {
    setFocusedQuickFilterItemIndex(null);
    setActiveQuickFilterItemId(null);
    setCurrentQuickFilter(undefined);
    //setArtemisFilters(initialArtemisFilters);
  };

  const closeQuickFilterMenu = () => {
    setIsQuickFilterOpen(false);
    resetQuickFilterActiveAndFocusedItem();
  };

  const onQuickFilterInputClick = () => {
    if (!isQuickFilterOpen) {
      setIsQuickFilterOpen(true);
    } else if (!quickFilterInputValue) {
      closeQuickFilterMenu();
    }
  };

  const quickFilterSelectOption = (value: string | number, content: string | number) => {
    // eslint-disable-next-line no-console
    console.log('selected', content);

    setQuickFilterInputValue(String(content));
    setQuickFilterFilterValue('');
    setSelectedQuickFilter(String(value));

    closeQuickFilterMenu();
    const quickFilter = quickFilters.find((filter) => filter.name === value);
    setCurrentQuickFilter(quickFilter);
  };

  const onQuickFilterSelect = (_event: React.MouseEvent<Element, MouseEvent> | undefined, value: string | number | undefined) => {
    if (value && value !== NO_RESULTS) {
      const optionText = selectQuickFilterOptions.find((option) => option.value === value)?.children;
      quickFilterSelectOption(value, optionText as string);
    }
  };

  const onQuickFilterTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setQuickFilterInputValue(value);
    setQuickFilterFilterValue(value);

    resetQuickFilterActiveAndFocusedItem();

    if (value !== selectedQuickFilter) {
      setSelectedQuickFilter('');
    }
  };

  const handleQuickFilterMenuArrowKeys = (key: string) => {
    let indexToFocus = 0;

    if (!isQuickFilterOpen) {
      setIsQuickFilterOpen(true);
    }

    if (selectQuickFilterOptions.every((option) => option.isDisabled)) {
      return;
    }

    if (key === 'ArrowUp') {
      // When no index is set or at the first index, focus to the last, otherwise decrement focus index
      if (focusedQuickFilterItemIndex === null || focusedQuickFilterItemIndex === 0) {
        indexToFocus = selectQuickFilterOptions.length - 1;
      } else {
        indexToFocus = focusedQuickFilterItemIndex - 1;
      }

      // Skip disabled options
      while (selectQuickFilterOptions[indexToFocus].isDisabled) {
        indexToFocus--;
        if (indexToFocus === -1) {
          indexToFocus = selectQuickFilterOptions.length - 1;
        }
      }
    }

    if (key === 'ArrowDown') {
      // When no index is set or at the last index, focus to the first, otherwise increment focus index
      if (focusedQuickFilterItemIndex === null || focusedQuickFilterItemIndex === selectQuickFilterOptions.length - 1) {
        indexToFocus = 0;
      } else {
        indexToFocus = focusedQuickFilterItemIndex + 1;
      }

      // Skip disabled options
      while (selectQuickFilterOptions[indexToFocus].isDisabled) {
        indexToFocus++;
        if (indexToFocus === selectQuickFilterOptions.length) {
          indexToFocus = 0;
        }
      }
    }

    setQuickFilterActiveAndFocusedItem(indexToFocus);
  };

  const onQuickFilterInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const focusedItem = focusedQuickFilterItemIndex !== null ? selectQuickFilterOptions[focusedQuickFilterItemIndex] : null;

    switch (event.key) {
      case 'Enter':
        if (isQuickFilterOpen && focusedItem && focusedItem.value !== NO_RESULTS && !focusedItem.isAriaDisabled) {
          quickFilterSelectOption(focusedItem.value, focusedItem.children as string);
        }

        if (!isQuickFilterOpen) {
          setIsQuickFilterOpen(true);
        }

        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleQuickFilterMenuArrowKeys(event.key);
        break;
    }
  };

  const onQuickFilterToggleClick = () => {
    setIsQuickFilterOpen(!isQuickFilterOpen);
    quickFilterTextInputRef?.current?.focus();
  };

  const onQuickFilterClearButtonClick = () => {
    setSelectedQuickFilter('');
    setQuickFilterInputValue('');
    setQuickFilterFilterValue('');
    resetQuickFilterActiveAndFocusedItem();
    quickFilterTextInputRef?.current?.focus();
  };

  const getQuickFilterSelectionsForView = () => {
    const viewableFilters = quickFilters.filter((filter) => filter.view === view);
    const ret =  selectQuickFilterOptions.filter(filter => containsViewableFilter(viewableFilters, filter));
    return ret;
  }

  const containsViewableFilter = (viewableFilters: QuickFilter[], filter: SelectOptionProps) => {
    const isSame = viewableFilters.some((viewableFilter) => viewableFilter.name === filter.value);
    return isSame;
  }

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      aria-label="Typeahead menu toggle"
      onClick={onQuickFilterToggleClick}
      isExpanded={isQuickFilterOpen}
      isFullWidth
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={quickFilterInputValue}
          onClick={onQuickFilterInputClick}
          onChange={onQuickFilterTextInputChange}
          onKeyDown={onQuickFilterInputKeyDown}
          id="typeahead-select-input"
          autoComplete="off"
          innerRef={quickFilterTextInputRef}
          placeholder="Select a Quick Filter"
          {...(activeQuickFilterItemId && { 'aria-activedescendant': activeQuickFilterItemId })}
          role="combobox"
          isExpanded={isQuickFilterOpen}
          aria-controls="select-typeahead-listbox"
        />

        <TextInputGroupUtilities {...(!quickFilterInputValue ? { style: { display: 'none' } } : {})}>
          <Button variant="plain" onClick={onQuickFilterClearButtonClick} aria-label="Clear input value" icon={<TimesIcon />} />
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
        <Button onClick={() => setShowFilterModal(true)}>Add</Button>
      </ToolbarItem>
      <ToolbarItem variant="separator"></ToolbarItem>
      <ToolbarItem>
        <Select
      id="typeahead-select"
      isOpen={isQuickFilterOpen}
      selected={selectedQuickFilter}
      onSelect={onQuickFilterSelect}
      onOpenChange={(isOpen) => {
        !isOpen && closeQuickFilterMenu();
      }}
      toggle={toggle}
      variant="typeahead"
    >
      <SelectList id="select-typeahead-listbox">
        {getQuickFilterSelectionsForView().map((option, index) => (
          <SelectOption
            key={option.value || option.children}
            isFocused={focusedQuickFilterItemIndex === index}
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