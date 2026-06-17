// stores/workspaceStore.ts
// إدارة حالة مساحة العمل باستخدام Zustand مع دعم الـ 3D
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Agent {
  id: string
  name: string
  avatar_emoji: string
  provider: string
  model: string
  system_prompt: string
  temperature: number
  max_tokens: number
  position_x: number
  position_z: number
  createdAt?: string
}

export interface Connection {
  id: string
  from: string // agent id
  to: string // agent id
}

interface WorkspaceState {
  // البيانات
  agents: Agent[]
  connections: Connection[]
  selectedAgent: Agent | null
  workspaceId: string | null
  mode: 'developer' | 'user' | null
  isLoading: boolean
  error: string | null

  // العمليات
  setWorkspace: (id: string, mode: 'developer' | 'user') => void
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, data: Partial<Agent>) => void
  removeAgent: (id: string) => void
  setSelectedAgent: (agent: Agent | null) => void
  addConnection: (connection: Connection) => void
  removeConnection: (id: string) => void
  clearConnections: () => void
  fetchAgents: () => Promise<void>
  reset: () => void
}

/**
 * مخزن مساحة العمل مع استمرار البيانات عبر الجلسة
 */
export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      agents: [],
      connections: [],
      selectedAgent: null,
      workspaceId: null,
      mode: null,
      isLoading: false,
      error: null,

      setWorkspace: (id, mode) => set({ workspaceId: id, mode }),

      setAgents: (agents) => set({ agents }),

      addAgent: (agent) =>
        set((state) => ({
          agents: [...state.agents, agent],
        })),

      updateAgent: (id, data) =>
        set((state) => ({
          agents: state.agents.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        })),

      removeAgent: (id) =>
        set((state) => ({
          agents: state.agents.filter((a) => a.id !== id),
          connections: state.connections.filter(
            (c) => c.from !== id && c.to !== id
          ),
        })),

      setSelectedAgent: (agent) => set({ selectedAgent: agent }),

      addConnection: (connection) =>
        set((state) => ({
          connections: [...state.connections, connection],
        })),

      removeConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((c) => c.id !== id),
        })),

      clearConnections: () => set({ connections: [] }),

      fetchAgents: async () => {
        const { workspaceId } = get()
        if (!workspaceId) {
          set({ error: 'لا توجد مساحة عمل محددة' })
          return
        }

        set({ isLoading: true, error: null })
        try {
          const { getWorkspaceAgents } = await import('@/lib/api')
          const agents = await getWorkspaceAgents(workspaceId)
          set({ agents, isLoading: false })
        } catch (error: any) {
          set({ error: error.message, isLoading: false })
        }
      },

      reset: () =>
        set({
          agents: [],
          connections: [],
          selectedAgent: null,
          workspaceId: null,
          mode: null,
          error: null,
        }),
    }),
    {
      name: 'workspace-storage', // مفتاح التخزين في localStorage
      partialize: (state) => ({
        workspaceId: state.workspaceId,
        mode: state.mode,
        agents: state.agents,
        connections: state.connections,
      }),
    }
  )
)
