// Local auth using localStorage - works without Supabase
export interface LocalUser {
    id: string
    display_name: string
}

export const GUEST_USER: LocalUser = {
    id: 'local-user',
    display_name: 'Player 1'
}

export function getLocalUser(): LocalUser | null {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem('wc_user')
    return stored ? JSON.parse(stored) : null
}

export function setLocalUser(displayName: string): LocalUser {
    const user: LocalUser = {
        id: `user-${Date.now()}`,
        display_name: displayName
    }
    localStorage.setItem('wc_user', JSON.stringify(user))
    return user
}

export function clearLocalUser() {
    localStorage.removeItem('wc_user')
}
