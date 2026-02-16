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

export const SAVED_FILTERS_KEY:string = "artemis.savedTableFilters";

export type Filter = {
  field: string
  operation: string
  value: string
}

export type TableFilters = {
    searchFilters: Filter[]
    sortOrder: string
    sortColumn: string
}

export const EMPTY_FILTER: TableFilters = {
    searchFilters: [],
    sortOrder: '',
    sortColumn: ''
}

export type SavedTableFilter = {
    name: string
    view: string
    tableFilters: TableFilters
}

export function getFilterOpSymbol(symbol: string):string {
    switch(symbol) { 
        case 'EQUALS': { 
            return '='
        } 
        case 'NOT_EQUALS': { 
            return '!='
        } 
        case 'GREATER_THAN': { 
            return '>'
        } 
        case 'LESSER_THAN': { 
            return '<'
        } 
        case 'CONTAINS': { 
            return '~'
        } 
        case 'NOT_CONTAINS': { 
            return '!~'
        } 
        default: { 
            return '='
        } 
    }
} 