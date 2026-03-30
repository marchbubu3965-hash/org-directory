import { useState } from 'react'

export const useNickname = () => {
  const [nickname, setNicknameState] = useState(
    () => localStorage.getItem('nickname') || ''
  )

  const setNickname = (name) => {
    localStorage.setItem('nickname', name)
    setNicknameState(name)
  }

  return { nickname, setNickname }
}
