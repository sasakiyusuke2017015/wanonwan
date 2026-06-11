import { beforeAll } from 'vitest'
import { setProjectAnnotations } from '@storybook/react'
import * as previewAnnotations from './preview.jsx'

const annotations = setProjectAnnotations([previewAnnotations])

beforeAll(annotations.beforeAll)
