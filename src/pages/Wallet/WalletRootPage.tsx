import React, { useContext, useEffect } from 'react'
import { MainContainer, Modal } from '../../components/PageComponents'
import { GlobalContext } from '../../App'
import { Route, BrowserRouter as Router, useHistory, Switch, useLocation } from 'react-router-dom'
import WalletHomePage from './WalletHomePage'
import SendPage from './SendPage'
import { AnimatePresence } from 'framer-motion'

const Wallet = () => {
  const { wallet } = useContext(GlobalContext)
  const history = useHistory()
  const location = useLocation()

  // Redirect if not wallet is set
  useEffect(() => {
    if (!wallet) {
      history.push('/')
    }
  }, [history, wallet])

  return (
    <MainContainer>
      <Route path="/wallet">
        <WalletHomePage />
      </Route>
      <AnimatePresence exitBeforeEnter initial={false}>
        <Switch location={location} key={location.pathname}>
          <Route path="/wallet/send" key="send">
            <Modal>
              <SendPage />
            </Modal>
          </Route>
        </Switch>
      </AnimatePresence>
    </MainContainer>
  )
}

export default Wallet
