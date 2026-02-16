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
import { Tabs, Tab, TabTitleText, Stack, PageSection, TabContent } from '@patternfly/react-core';
import { ProducerTable } from '../producers/ProducerTable';
import { ConsumerTable } from '../consumers/ConsumerTable';
import { ConnectionsTable } from '../connections/ConnectionsTable';
import { SessionsTable } from '../sessions/SessionsTable';
import { AddressesTable } from '../addresses/AddressesTable';
import { ArtemisContext, useArtemisTree } from '../context';
import { Status } from '../status/Status';
import { QueuesView } from '../queues/QueuesView';
import { BrokerDiagram } from '../brokers/BrokerDiagram';
import { artemisService } from '../artemis-service';
import { useSearchParams } from 'react-router-dom';
import { Filter } from '../util/filter-util';


export type Broker = {
  columnStorageLocation?: string
}

export type Navigate = {
  search: Function
  filter?: Filter
}

export const ArtemisTabs: React.FunctionComponent = () => {

  const { tree, selectedNode, brokerNode, setSelectedNode, findAndSelectNode } = useArtemisTree();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchFilter, setSearchFilter] = useState<Filter | undefined>();

  const activeTabKey = searchParams.get('tab') || 'status';


  const handleTabClick = (event: React.MouseEvent<any> | React.KeyboardEvent | MouseEvent, tabIndex: string | number
  ) => {
    setSearchFilter(undefined);
    setSearchParams({ tab: String(tabIndex) }, { replace: false });
  };

  const handleSearch = (tab: number, filter: Filter) => {
      setSearchFilter(filter);+
      setSearchParams({ tab: String(tab) }, { replace: false });
  };

  useEffect(() => {

  }, [searchFilter, activeTabKey])

  // The BrokerTopology needs to be in it's own Page Section outside of the Tabs, it wont resize the tab content otherwise
  return (
    <ArtemisContext.Provider value={{ tree, selectedNode, brokerNode, setSelectedNode, findAndSelectNode }}>
        <Stack>
          <PageSection type="tabs">
            <Tabs activeKey={activeTabKey}
              onSelect={handleTabClick}
              aria-label="artemistabs">
              <Tab eventKey={'status'} title={<TabTitleText>Status</TabTitleText>} aria-label="status">
                {activeTabKey === 'status' &&
                  <Status/>
                }
              </Tab>
              { artemisService.canListConnections(brokerNode) &&
              <Tab eventKey={'connections'} title={<TabTitleText>Connections</TabTitleText>} aria-label="connections">
                {activeTabKey === 'connections' &&
                  <ConnectionsTable search={handleSearch} filter={searchFilter}/>
                }
              </Tab>
              }
              { artemisService.canListSessions(brokerNode) &&
              <Tab eventKey={'sessions'} title={<TabTitleText>Sessions</TabTitleText>} aria-label="sessions">
                {activeTabKey === 'sessions' &&
                  <SessionsTable search={handleSearch} filter={searchFilter}/>
                }
              </Tab>
              }
              { artemisService.canListProducers(brokerNode) &&
              <Tab eventKey={'producers'} title={<TabTitleText>Producers</TabTitleText>} aria-label="producers">
                {activeTabKey === 'producers' &&
                  <ProducerTable search={handleSearch} filter={searchFilter}/>
                }
              </Tab>
              }
              { artemisService.canListConsumers(brokerNode) &&
              <Tab eventKey={'consumers'} title={<TabTitleText>Consumers</TabTitleText>} aria-label="consumers">
                {activeTabKey === 'consumers' &&
                  <ConsumerTable search={handleSearch} filter={searchFilter}/>
                }
              </Tab>
              }
              { artemisService.canListAddresses(brokerNode) &&
              <Tab eventKey={'addresses'} title={<TabTitleText>Addresses</TabTitleText>} aria-label="addresses">
                {activeTabKey === 'addresses' &&
                  <AddressesTable search={handleSearch} filter={searchFilter}/>
                }
              </Tab>
              }
              { artemisService.canListQueues(brokerNode) &&
              <Tab eventKey={'queues'} title={<TabTitleText>Queues</TabTitleText>} aria-label="queues">
                {activeTabKey === 'queues' &&
                  <QueuesView search={handleSearch} filter={searchFilter}/>
                }
              </Tab>
              }
              { artemisService.canListNetworkTopology(brokerNode) &&
              <Tab eventKey={'diagram'} title={<TabTitleText>Broker Diagram</TabTitleText>} aria-label="broker-diagram">
              </Tab>
              }
          </Tabs>
        </PageSection>
        <PageSection padding={{ default: 'noPadding' }}>
            <TabContent key={'diagram'} eventKey={'diagram'} id={`tabContent${7}`} activeKey={activeTabKey} hidden={'diagram' !== activeTabKey}  style={{height: "100%"}}>
            {activeTabKey === 'diagram' &&
              <BrokerDiagram />   
            }
            </TabContent>
        </PageSection>
      </Stack>
    </ArtemisContext.Provider>
  )

}
