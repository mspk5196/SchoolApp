import React from 'react'
import { SafeAreaProvider,SafeAreaView } from 'react-native-safe-area-context'
import AppLayout from './src/navigations/AppLayout'
import { StatusBar } from 'react-native'

const App = () => {
  return (
    <SafeAreaProvider >
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <AppLayout />
    </SafeAreaProvider>
  )
}

export default App
