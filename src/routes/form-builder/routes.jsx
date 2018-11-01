/**
 * Form builder routes
 */
import React from 'react'
import { Route } from 'react-router-dom'
import { renderApp } from '../../components/App/App'
import TopBarContainer from '../../components/TopBar/TopBarContainer'
import FormBuilderToolBar from './components/FormBuilderToolBar'
import FormBuilderContainer from './containers/FormBuilderContainer'

export default (
  <Route path="/form-builder" render={renderApp(<TopBarContainer toolbar={FormBuilderToolBar} />, <FormBuilderContainer />)} />
)
