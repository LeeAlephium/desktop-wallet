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

import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import { Address } from '../contexts/addresses'
import AddressBadge from './AddressBadge'
import Amount from './Amount'
import ClipboardButton from './Buttons/ClipboardButton'
import QRCodeButton from './Buttons/QRCodeButton'
import Truncate from './Truncate'

interface AddressSummaryCardProps {
  address: Address
  totalCards: number
  index: number
  clickable?: boolean
  className?: string
  position?: number
}

export const addressSummaryCardWidthPx = 100

const AddressSummaryCard = ({ address, clickable, className, index, totalCards }: AddressSummaryCardProps) => {
  const history = useHistory()

  const collapsedPosition = !clickable ? (totalCards - index) * -109 + 5 : 0

  return (
    <motion.div
      className={className}
      initial={{ x: collapsedPosition - 20 }}
      animate={{ x: collapsedPosition }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <ClickableArea
        onClick={() => clickable && history.push(`/wallet/addresses/${address.hash}`)}
        clickable={clickable}
      >
        <AddressNameSection>
          <AddressBadge color={address.settings.color} addressName={address.getLabelName()} truncate />
          <Hash>{address.hash}</Hash>
        </AddressNameSection>
        <AmountsSection>
          <AmountHighlighted value={BigInt(address.details.balance)} fadeDecimals />
        </AmountsSection>
      </ClickableArea>
      <ButtonsSection>
        <ClipboardButton textToCopy={address.hash} />
        <QRCodeButton textToEncode={address.hash} />
      </ButtonsSection>
    </motion.div>
  )
}

export default styled(AddressSummaryCard)`
  display: flex;
  flex-direction: column;
  width: ${addressSummaryCardWidthPx}px;
  height: 95%;
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: var(--radius-medium);
`

const PaddedSection = styled.div`
  padding: 11px 17px;
`

const AddressNameSection = styled(PaddedSection)`
  display: flex;
  flex-direction: column;
  align-items: center;

  > * {
    max-width: 100%;
  }
`

const Hash = styled(Truncate)`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 10px;
  font-weight: var(--fontWeight-medium);
  margin-top: var(--spacing-1);
`

const AmountsSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.primary};
  border-top: 1px solid ${({ theme }) => theme.border.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  text-align: center;
  padding: 11px 0;
`

const AmountHighlighted = styled(Amount)`
  font-size: 1.2em;
`

const ButtonsSection = styled(PaddedSection)`
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
`

const ClickableArea = styled.div<{ clickable?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
`
