import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import Provider from 'Provider'
import SWUpdateDialog from 'components/atoms/SWUpdateDialog'

ReactDOM.render(
  <Provider>
    <App />
  </Provider>,
  document.getElementById('root'),
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register({
  onUpdate: registration => {
    if (registration.waiting) {
      const container = document.querySelector('.sw-update-dialog')
      ReactDOM.render(
        <SWUpdateDialog registration={registration} />,
        container,
        () => container?.classList.add('show'),
      )
    }
  },
})
