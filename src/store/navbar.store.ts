import { create } from 'zustand'

interface NavbarStoreProps {
  open: boolean
  setOpen: () => void
}

export const navbarStore = create<NavbarStoreProps>((set) => ({
  open: true,
  setOpen: () => set((state: { open: boolean }) => ({ open: !state.open }))
}))
