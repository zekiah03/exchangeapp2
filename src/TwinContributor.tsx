import { useEffect, useRef } from 'react'
import { contributeToTwin } from './contribute'

interface Props {
  likeItems: string[]
  hardItems: string[]
  takeawayReady: boolean
}

export function TwinContributor({ likeItems, hardItems, takeawayReady }: Props) {
  const contributed = useRef(false)

  useEffect(() => {
    if (!takeawayReady || contributed.current) return
    contributed.current = true
    contributeToTwin('exchangeapp2', { likeItems, hardItems })
  }, [takeawayReady, likeItems, hardItems])

  return null
}
