/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { Input, Output } from 'alephium-js/dist/api/api-explorer'
import { calAmountDelta } from 'alephium-js/dist/lib/numbers'
import dayjs from 'dayjs'
import { AnimatePresence } from 'framer-motion'
import _ from 'lodash'
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'

import Amount from '../../components/Amount'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import ClipboardButton from '../../components/Buttons/ClipboardButton'
import OpenInExplorerButton from '../../components/Buttons/OpenInExplorerButton'
import QRCodeButton from '../../components/Buttons/QRCodeButton'
import DataList, { DataListCell, DataListRow } from '../../components/DataList'
import Label from '../../components/Label'
import { MainContent, PageTitleRow } from '../../components/PageComponents/PageContainers'
import { PageH1, PageH2 } from '../../components/PageComponents/PageHeadings'
import Table, { TableCell, TableProps, TableRow } from '../../components/Table'
import { AddressHash, useAddressesContext } from '../../contexts/addresses'
import AddressOptionsModal from './AddressOptionsModal'

const transactionsTableHeaders: TableProps['headers'] = [
  { title: 'Direction' },
  { title: 'Timestamp' },
  { title: 'Address(es)' },
  { title: 'Amount', align: 'end' }
]

interface IOListProps {
  currentAddress: string
  isOut: boolean
  outputs?: Output[]
  inputs?: Input[]
  timestamp: number
}

const minTableColumnWidth = '104px'

const AddressDetailsPage = () => {
  const [isAddressOptionsModalOpen, setIsAddressOptionsModalOpen] = useState(false)
  const { getAddressState } = useAddressesContext()
  const { addressHash } = useParams<{ addressHash: AddressHash }>()
  const addressData = getAddressState(addressHash)
  const history = useHistory()

  if (!addressData) return null

  return (
    <MainContent>
      <PageTitleRow>
        <Title>
          <ArrowLeftStyled onClick={() => history.goBack()} />
          <PageH1Styled>
            Address details {addressData.settings.isMain && <MainAddress>Main address</MainAddress>}
          </PageH1Styled>
          {addressData.settings.label && (
            <LabelStyled color={addressData.settings.color}>{addressData.settings.label}</LabelStyled>
          )}
          <OptionsButton
            transparent
            squared
            onClick={() => setIsAddressOptionsModalOpen(true)}
            aria-label="Address options"
          >
            <SettingsIcon />
          </OptionsButton>
        </Title>
      </PageTitleRow>
      <DataList>
        <DataListRow>
          <DataListCell>Address</DataListCell>
          <DataListCell>
            {addressHash}
            <ClipboardButton textToCopy={addressHash} />
            <QRCodeButton textToEncode={addressHash} />
            <OpenInExplorerButton address={addressHash} />
          </DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>Label</DataListCell>
          <DataListCell>
            {addressData.settings.label ? (
              <Label color={addressData.settings.color}>{addressData.settings.label}</Label>
            ) : (
              '-'
            )}
          </DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>Number of transactions</DataListCell>
          <DataListCell>{addressData.details?.txNumber}</DataListCell>
        </DataListRow>
        {addressData.details?.lockedBalance && BigInt(addressData.details.lockedBalance) > 0 && (
          <DataListRow>
            <DataListCell>Locked ALPH balance</DataListCell>
            <DataListCell>
              <Amount value={BigInt(addressData.details.lockedBalance)} fadeDecimals />
            </DataListCell>
          </DataListRow>
        )}
        <DataListRow>
          <DataListCell>Total ALPH balance</DataListCell>
          <DataListCell>
            {addressData.details?.balance ? (
              <AmountStyled value={BigInt(addressData.details.balance)} fadeDecimals />
            ) : (
              '-'
            )}
          </DataListCell>
        </DataListRow>
      </DataList>
      <PageH2>Transaction history</PageH2>
      <Table headers={transactionsTableHeaders} minColumnWidth={minTableColumnWidth}>
        {addressData.transactions.pending &&
          addressData.transactions.pending
            .slice(0)
            .reverse()
            .map((transaction) => {
              const amount = transaction.amount
              const amountIsBigInt = typeof amount === 'bigint'

              return (
                <TableRow key={transaction.txId} minColumnWidth={minTableColumnWidth} blinking>
                  <TableCell>
                    <Badge content="Pending" type="neutral" />
                  </TableCell>
                  <TableCell>{dayjs(transaction.timestamp).fromNow()}</TableCell>
                  <TableCell truncate>
                    <DarkLabel>To</DarkLabel>
                    <span>{transaction.toAddress}</span>
                  </TableCell>
                  <TableCell align="end">
                    <Badge
                      type="minus"
                      prefix="-"
                      content={amountIsBigInt && amount < 0 ? (amount * -1n).toString() : amount.toString()}
                      amount
                    />
                  </TableCell>
                </TableRow>
              )
            })}
        {addressData.transactions.confirmed &&
          addressData.transactions.confirmed.map((transaction) => {
            const amount = calAmountDelta(transaction, addressHash)
            const amountIsBigInt = typeof amount === 'bigint'
            const isOut = amountIsBigInt && amount < 0

            return (
              <TableRow key={transaction.hash} minColumnWidth={minTableColumnWidth}>
                <TableCell>
                  <Badge content={isOut ? '↑ Sent' : '↓ Received'} type={isOut ? 'minus' : 'plus'} />
                </TableCell>
                <TableCell>{dayjs(transaction.timestamp).fromNow()}</TableCell>
                <TableCell truncate>
                  <DarkLabel>{isOut ? 'To' : 'From'}</DarkLabel>
                  <IOList
                    currentAddress={addressHash}
                    isOut={isOut}
                    outputs={transaction.outputs}
                    inputs={transaction.inputs}
                    timestamp={transaction.timestamp}
                  />
                </TableCell>
                <TableCell align="end">
                  <Badge
                    type={isOut ? 'minus' : 'plus'}
                    prefix={isOut ? '- ' : '+ '}
                    content={amountIsBigInt && amount < 0 ? (amount * -1n).toString() : amount.toString()}
                    amount
                  />
                </TableCell>
              </TableRow>
            )
          })}
      </Table>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isAddressOptionsModalOpen && (
          <AddressOptionsModal addressHash={addressHash} onClose={() => setIsAddressOptionsModalOpen(false)} />
        )}
      </AnimatePresence>
    </MainContent>
  )
}

const IOList = ({ currentAddress, isOut, outputs, inputs, timestamp }: IOListProps) => {
  const io = (isOut ? outputs : inputs) as Array<Output | Input> | undefined
  const genesisTimestamp = 1231006505000

  if (io && io.length > 0) {
    return io.every((o) => o.address === currentAddress) ? (
      <span>{currentAddress}</span>
    ) : (
      <>
        {_(io.filter((o) => o.address !== currentAddress))
          .map((v) => v.address)
          .uniq()
          .value()
          .map((v) => (
            <span key={v}>{v}</span>
          ))}
      </>
    )
  } else if (timestamp === genesisTimestamp) {
    return <DarkLabel>Genesis TX</DarkLabel>
  } else {
    return <DarkLabel>Mining Rewards</DarkLabel>
  }
}

const Title = styled.div`
  display: flex;
  align-items: center;
`

const ArrowLeftStyled = styled(ArrowLeft)`
  margin-right: var(--spacing-2);

  &:hover {
    cursor: pointer;
  }
`

const AmountStyled = styled(Amount)`
  color: ${({ theme }) => theme.font.highlight};
`

const LabelStyled = styled(Label)`
  margin-left: var(--spacing-5);
`

const OptionsButton = styled(Button)`
  margin-left: var(--spacing-5);
  color: ${({ theme }) => theme.font.primary};
`

const PageH1Styled = styled(PageH1)`
  position: relative;
`

const MainAddress = styled.div`
  color: ${({ theme }) => theme.font.highlight};
  font-size: 9px;
  position: absolute;
`

const DarkLabel = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 3px 10px;
  border-radius: var(--radius-small);
  min-width: 50px;
  display: inline-flex;
  justify-content: center;
  margin-right: var(--spacing-4);
`

export default AddressDetailsPage
