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

import { FormGroup, Form, TextInput, FormFieldGroupExpandable, FormFieldGroupHeader, Button, SelectList, SelectOption, Select, MenuToggle, MenuToggleElement, Toolbar, ToolbarContent, ToolbarItem, Flex, FlexItem, FormSelect, FormSelectOption, Chip, ChipGroup } from "@patternfly/react-core";
import { useSearchParams } from "react-router-dom";
import { ArtemisFilters, Filter, getFilterOpSymbol, QuickFilter } from "../util/filter-util";
import { useState } from "react";

export type CreateQuickFilterProps = {
    columns: { id: string; name: string; visible: boolean }[];
    initialArtemisFilters: ArtemisFilters
    initialFilter: { column: string; operation: string; input: string };
    operationOptions: { id: string; name: string }[];
    quickFilter: QuickFilter
    setQuickFilter: Function
}
export const CreateQuickFilter: React.FC<CreateQuickFilterProps> = (props) => {

    const [filterColumn, setFilterColumn] = useState(
        props.columns.find(c => c.id === props.initialFilter.column)
    );
    const [orderColumn, setOrderColumn] = useState(
        props.columns.find(c => c.id === props.initialFilter.column)
    );
    const [filterOperation, setFilterOperation] = useState(
        props.operationOptions.find(o => o.id === props.initialFilter.operation)
    );
    const [filterValue, setFilterValue] = useState('')
    const [columnOpen, setColumnOpen] = useState(false);
    const [operationsOpen, setOperationsOpen] = useState(false);
    

    const  addFilter = () => {
        if (filterOperation && filterColumn) {
                const filter: Filter = {
                field: filterColumn.id,
                operation: filterOperation.id,
                value: filterValue
            }
            const updatedFilters = [...props.quickFilter.artemisFilter.searchFilters];
            updatedFilters.push(filter);
            const updatedQuickFilter: QuickFilter = {
                name: props.quickFilter.name,
                view: props.quickFilter.view,
                artemisFilter: {
                    searchFilters: updatedFilters,
                    sortOrder: "",
                    sortColumn: ""
                }
            }
            props.setQuickFilter(updatedQuickFilter);
        }
    }

    const deleteFilter = (id: string) => {
        const copyOfFilters = [...props.quickFilter.artemisFilter.searchFilters];
        const filteredCopy = copyOfFilters.filter((artemisFilter: Filter) => artemisFilter.field + artemisFilter.operation + artemisFilter.value !== id);
        const updatedQuickFilter: QuickFilter = {
                name: props.quickFilter.name,
                view: props.quickFilter.view,
                artemisFilter: {
                    searchFilters: filteredCopy,
                    sortOrder: "",
                    sortColumn: ""
                }
            }
            props.setQuickFilter(updatedQuickFilter);
      };

      const updateQuickFilterName = (name: string) => {
        const updatedQuickFilter: QuickFilter = {
            name: name,
            view: props.quickFilter.view,
            artemisFilter: props.quickFilter.artemisFilter
        }
        props.setQuickFilter(updatedQuickFilter);
      }

      const updateQuickFilterNameSortDirection = (direction: string, column: string) => {
        const artemisFilterCopy = {...props.quickFilter.artemisFilter};
        artemisFilterCopy.sortOrder = direction;
        artemisFilterCopy.sortColumn = column;
        const updatedQuickFilter: QuickFilter = {
            name: props.quickFilter.name,
            view: props.quickFilter.view,
            artemisFilter: artemisFilterCopy
        }
        props.setQuickFilter(updatedQuickFilter);
      }

    return <>
        <Form label={'Create ' + props.quickFilter.view + ' Quick Filter'}>
            <FormGroup label="Quick Filter Name">
                <TextInput
                    aria-label="quick-filter-name"
                    onChange={(_event, value) => updateQuickFilterName(value)}
                    value={props.quickFilter.name}/>
            </FormGroup>
            <FormGroup label="Filter">
                <ChipGroup>
                    {props.quickFilter.artemisFilter.searchFilters.map((filter) => (
                        <Chip key={filter.field + filter.operation + filter.value} onClick={() => deleteFilter(filter.field + filter.operation + filter.value)}>
                        {filter.field + getFilterOpSymbol(filter.operation) + filter.value}
                        </Chip>
                    ))}
                </ChipGroup>
            </FormGroup>
            <FormGroup>
                <FormSelect label="column"
                    aria-label="Select Input"
                    onChange={(_e, selection) => {
                        const selectedColumn = props.columns.find(c => c.name === selection);
                        setFilterColumn(selectedColumn);
                        setColumnOpen(false); }}
                    value={filterColumn?.name}   
                    >
                        {props.columns.map(column => (
                        <FormSelectOption key={column.id} value={column.name} label={column.name}>{column.name}</FormSelectOption>
                        ))}
                </FormSelect>

                <FormSelect label="operations" 
                    aria-label="Select Input"
                    onChange={(_e, selection) => {
                        const selectedOp = props.operationOptions.find(c => c.name === selection);
                        setFilterOperation(selectedOp);
                        setOperationsOpen(false); }}
                    value={filterOperation?.name}   
                    >
                        {props.operationOptions.map(op => (
                        <FormSelectOption key={op.id} value={op.name} label={op.name}>{op.name}</FormSelectOption>
                        ))}
                </FormSelect>
                <TextInput aria-label="add-filter" onChange={(_e, selection) => {
                        setFilterValue(selection); }}></TextInput>
                <Button onClick={() => addFilter()}>add</Button>
            </FormGroup>
            <FormGroup label="Sorting Column">
                <FormSelect label="order column" 
                    aria-label="Select Input"
                    onChange={(_e, selection) => {
                        const selectedOrderColumn = props.columns.find(c => c.name === selection);
                        setOrderColumn(selectedOrderColumn); }}
                    value={orderColumn?.name}   
                    >
                        {props.columns.map(column => (
                            <FormSelectOption key={column.id} value={column.name} label={column.name}>{column.name}</FormSelectOption>
                        ))}
                </FormSelect>
            </FormGroup>

            <FormGroup label="Sort Direction">
                <FormSelect label="sort column"
                    aria-label="Select Input"
                    onChange={(_e, selection) => {
                        updateQuickFilterNameSortDirection(selection, props.quickFilter.artemisFilter.sortColumn); }}
                    value={props.quickFilter.artemisFilter.sortOrder}
                    >
                        <FormSelectOption key="asc" value="Ascending" label="Ascending"></FormSelectOption>
                        <FormSelectOption key="desc" value="Descending" label="Descending"></FormSelectOption>
                </FormSelect>
            </FormGroup>
        </Form>
    </>;
}