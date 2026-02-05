import { UserCheckIcon } from 'lucide-react'
import { UserRoundXIcon } from 'lucide-react'

import { Alert, AlertTitle } from '@/components/ui/alert'

export const AlertIndicatorSuccess = ({ message }) => {
  return (
    <Alert className='sticky top-0 z-50 rounded-md bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400'>
      <UserCheckIcon />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  )
}


export const AlertIndicatorDestructive = ({ message }) => {
  return (
    <Alert className='border-destructive bg-destructive/10 text-destructive rounded-none border-0 border-l-6'>
      <UserRoundXIcon />
      <AlertTitle>{message}</AlertTitle>
    </Alert>
  )
}

