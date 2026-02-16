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
import { Button, Card, CardBody, CardTitle, DescriptionList, DescriptionListDescription, DescriptionListGroup, DescriptionListTerm, ExpandableSection, Popover, Title } from "@patternfly/react-core"
import { AddressDetails, artemisService, Queue } from "../artemis-service"
import { useEffect, useState } from "react"
import { eventService, jolokiaService } from "@hawtio/react"
import { ExclamationTriangleIcon, PlusCircleIcon } from "@patternfly/react-icons"
import { Table, Thead, Tr, Th, Tbody, Td } from "@patternfly/react-table"
import { CreateQueue } from "../queues/CreateQueue"

interface AddressDetailProps {
    name: string
    back: Function
}
export const AddressDetail: React.FunctionComponent<AddressDetailProps> = (addressDetailProps) => {
    const [ addressDetails, setAddressDetails ] = useState<AddressDetails>();
    const [ queues, setQueues ] = useState<Queue[]>();
    
    const getAddresses = async () => {
        artemisService.getAddressDetails(addressDetailProps.name)
            .then((addressDetails) => {
                setAddressDetails(addressDetails)
            })
            .catch((error) => {
                eventService.notify({type: 'warning', message: jolokiaService.errorMessage(error) })
            });
    }

    const getQueues = async () => {
        artemisService.filterQueuesForAddress(addressDetailProps.name, [])
        .then((queues) => {
            setQueues(queues);
        })
        .catch((error) => {
            eventService.notify({type: 'warning', message: jolokiaService.errorMessage(error) })
        })
    }

    useEffect(() => {
        // run only once at the beginning
        getAddresses();

        getQueues();

    }, [])

    return (
        <>
            <Button onClick={() => addressDetailProps.back() }>Back</Button>
            <Title headingLevel="h2">Address{': ' + addressDetailProps.name}</Title>
            <Card ouiaId="BasicCard" isCompact isFlat>
                <CardTitle>Info</CardTitle>
                <CardBody>
                    <DescriptionList
                    columnModifier={{
                    default: '3Col'
                    }}
                >
                    <DescriptionListGroup>
                        <DescriptionListTerm>Number Of Messages</DescriptionListTerm>
                        <DescriptionListDescription>{addressDetails?.NumberOfMessages}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Queue Count</DescriptionListTerm>
                        <DescriptionListDescription>{addressDetails?.QueueCount}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Number of Messages</DescriptionListTerm>
                        <DescriptionListDescription>{addressDetails?.NumberOfMessages}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Number of Pages</DescriptionListTerm>
                        <DescriptionListDescription>{addressDetails?.NumberOfPages}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Is Paging</DescriptionListTerm>
                        <DescriptionListDescription>{' ' + addressDetails?.Paging}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Is Paused</DescriptionListTerm>
                        <DescriptionListDescription>{' ' + addressDetails?.Paused}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Messages Routed</DescriptionListTerm>
                        <DescriptionListDescription>{addressDetails?.RoutedMessageCount}</DescriptionListDescription>
                    </DescriptionListGroup>
                </DescriptionList>
            </CardBody>
            </Card>
            <Card ouiaId="BasicCard" isCompact isFlat>
                <CardTitle>Queues</CardTitle>
                <CardBody>
                    <Table aria-label="Sortable table custom toolbar" variant="compact">
                        <Thead>
                        <Tr>
                            <Th>Name</Th>
                            <Th>Routing Type</Th>
                            <Th>Message Count</Th>
                            <Th></Th>
                        </Tr>
                        </Thead>
                        <Tbody>
                        {queues?.map((queue, rowIndex) => (
                            <Tr key={rowIndex}>
                            <Td>{queue.name}</Td>
                            <Td>{queue.routingType}</Td>
                            <Td>{queue.messageCount}</Td>
                            <Td>{queue.messageCount>20 && 
                                <Popover
                                triggerAction="hover"
                                    aria-label="Basic popover"
                                    headerContent={<div>Max Messages Detected</div>}
                                    bodyContent={<div>Link to somewehre to help.</div>}
                                    footerContent="Popover footer"
                                    >
                                <ExclamationTriangleIcon/>
                                </Popover>}
                                </Td>
                            </Tr>
                        ))}
                        </Tbody>
                    </Table>
                    </CardBody>
                    </Card>
             <ExpandableSection toggleTextExpanded="Address Settings" toggleTextCollapsed="Address Settings">
                 <Card ouiaId="BasicCard" isCompact isFlat>
                <CardBody>
                    <DescriptionList
                    columnModifier={{
                    default: '3Col'
                    }}
                >
                    <DescriptionListGroup>
                        <DescriptionListTerm>Number Of Messages</DescriptionListTerm>
                        <DescriptionListDescription>{addressDetails?.NumberOfMessages}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Queue Count</DescriptionListTerm>
                        <DescriptionListDescription>{addressDetails?.QueueCount}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Number of Messages</DescriptionListTerm>
                        <DescriptionListDescription>{addressDetails?.NumberOfMessages}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Number of Pages</DescriptionListTerm>
                        <DescriptionListDescription>{addressDetails?.NumberOfPages}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Is Paging</DescriptionListTerm>
                        <DescriptionListDescription>{' ' + addressDetails?.Paging}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Is Paused</DescriptionListTerm>
                        <DescriptionListDescription>{' ' + addressDetails?.Paused}</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                        <DescriptionListTerm>Messages Routed</DescriptionListTerm>
                        <DescriptionListDescription>{addressDetails?.RoutedMessageCount}</DescriptionListDescription>
                    </DescriptionListGroup>
                </DescriptionList>
            </CardBody>
            </Card>
             </ExpandableSection>
        </>
    )
}