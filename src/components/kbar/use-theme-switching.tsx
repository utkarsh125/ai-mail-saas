import { Action, useRegisterActions } from 'kbar'

import React from 'react'
import { useTheme } from 'next-themes'

const useThemeSwitching = () => {

    const {theme, setTheme} = useTheme()
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light': 'dark')
    }
    const themeActions: Action[] = [
        {
            id: "toggleTheme",
            name: "Toggle Theme",
            shortcut: ['t','c'],
            section: "Theme",
            perform: toggleTheme
        }, 

        {
            id: "setLightTheme",
            name: "Set Light Theme",
            section: "Theme",
            perform: () => setTheme('light')
        },
        {
            id: "setDarkTheme",
            name: "Set Dark Theme",
            section: "Theme",
            perform: () => setTheme('dark')
        }
    ]

    useRegisterActions(themeActions, [theme])
}

export default useThemeSwitching