import { Button, Card, CardBody, CardHeader, Chip, ChipGroup, Divider, Grid, GridItem, Toolbar, ToolbarItem } from "@patternfly/react-core"
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table"
import { getFilterOpSymbol, SAVED_FILTERS_KEY, SavedTableFilter } from "./util/filter-util"
import { useState } from "react";

export const ArtemisTableFilters: React.FunctionComponent = () => {

    const [filterSelections, setFilterSelections] = useState(["Connections", "Sessions", "Producers", "Consumers", "Addresses", "Queues"]);
    
    const [ tableFilters, setTableFilters ] = useState<SavedTableFilter[]>(() => {
    const storedTableFilters = localStorage.getItem(SAVED_FILTERS_KEY);
    if (storedTableFilters) {
        return JSON.parse(storedTableFilters) as SavedTableFilter[];
    }
    return []; 
    });
          
    return (<Card>
        <Grid hasGutter>
                
                <GridItem span={12} rowSpan={3}>
                <Card isFullHeight={true} >
                    <CardHeader>
                        <Toolbar>
                            <ToolbarItem>
                                <Button>Create</Button>
                            </ToolbarItem>
                        </Toolbar>
                    </CardHeader>
                    <CardBody>
                        <Divider />
                        <Table variant="compact">
                            <Thead>
                                <Tr>
                                <Th>Name</Th>
                                <Th>View</Th>
                                <Th>filter</Th>
                                <Th>Sort Column</Th>
                                <Th>Sort Order</Th>
                                <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {tableFilters?.map((tableFilter) => 
                                <Tr>
                                    <Td>{tableFilter.name}</Td>
                                    <Td>{tableFilter.view}</Td>
                                    <Td>
                                        <ChipGroup>
                                            {tableFilter.tableFilters.searchFilters.map((filter) => 
                                                <Chip isReadOnly>{filter.field + getFilterOpSymbol(filter.operation) + filter.value}</Chip>
                                            )}
                                        </ChipGroup>
                                    </Td>
                                    <Td>{tableFilter.tableFilters.sortColumn}</Td>
                                    <Td>{tableFilter.tableFilters.sortOrder}</Td>
                                </Tr>)}
                            </Tbody>
                        </Table>
                    </CardBody>
                </Card>
            </GridItem>
        </Grid>

    </Card>)
}