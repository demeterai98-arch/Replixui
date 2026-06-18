// components/drawers/AgentSettingsDrawer.tsx
// لوحة جانبية لتعديل إعدادات الوكيل مع دعم كامل للـ UI/UX
'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWorkspaceStore, type Agent } from '@/stores/workspaceStore'
import { toast } from 'sonner'
import { updateAgent, deleteAgent } from '@/lib/api'

interface AgentSettingsDrawerProps {
  open: boolean
  onClose: () => void
  agent: Agent | null
  onAgentUpdated?: (agent: Agent) => void
  onAgentDeleted?: (id: string) => void
}

// قائمة الإيموجي المتاحة
const AVATARS = ['🤖', '🧠', '👩‍💻', '👨‍💻', '🧑‍🔬', '📊', '🎯', '⚡', '🎨', '🔍', '🚀', '🦾']

// مزودو الخدمة والنماذج
const PROVIDERS = {
  openai: {
    label: 'OpenAI',
    icon: '🤖',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  anthropic: {
    label: 'Anthropic',
    icon: '🧠',
    models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  },
  gemini: {
    label: 'Google Gemini',
    icon: '✨',
    models: ['gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-pro'],
  },
} as const

type ProviderKey = keyof typeof PROVIDERS

export default function AgentSettingsDrawer({
  open,
  onClose,
  agent,
  onAgentUpdated,
  onAgentDeleted,
}: AgentSettingsDrawerProps) {
  const { updateAgent: updateStoreAgent, removeAgent: removeStoreAgent } = useWorkspaceStore()
  const [formData, setFormData] = useState<Partial<Agent>>({
    name: '',
    avatar_emoji: '🤖',
    provider: 'openai',
    model: 'gpt-4o',
    system_prompt: '',
    temperature: 0.7,
    max_tokens: 1000,
    position_x: 0,
    position_z: 0,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // تحميل بيانات الوكيل عند فتح الدراوير
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        avatar_emoji: agent.avatar_emoji || '🤖',
        provider: agent.provider || 'openai',
        model: agent.model || 'gpt-4o',
        system_prompt: agent.system_prompt || '',
        temperature: agent.temperature ?? 0.7,
        max_tokens: agent.max_tokens ?? 1000,
        position_x: agent.position_x ?? 0,
        position_z: agent.position_z ?? 0,
      })
    }
  }, [agent])

  const handleSave = useCallback(async () => {
    if (!agent?.id) {
      toast.error('لا يمكن التحديث، الوكيل غير معرّف')
      return
    }

    // التحقق من صحة البيانات
    if (!formData.name?.trim()) {
      toast.error('الرجاء إدخال اسم للوكيل')
      return
    }

    setIsSaving(true)
    try {
      // تحديث في قاعدة البيانات
      const updated = await updateAgent(agent.id, formData)

      // تحديث في المتجر (store)
      updateStoreAgent(agent.id, updated)

      // إعلام المكون الأب
      onAgentUpdated?.(updated)

      toast.success('تم تحديث الوكيل بنجاح')
      onClose()
    } catch (error: any) {
      toast.error(`فشل التحديث: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }, [agent, formData, updateStoreAgent, onAgentUpdated, onClose])

  const handleDelete = useCallback(async () => {
    if (!agent?.id) return
    if (!confirm('هل أنت متأكد من حذف هذا الوكيل؟')) return

    setIsDeleting(true)
    try {
      await deleteAgent(agent.id)
      removeStoreAgent(agent.id)
      onAgentDeleted?.(agent.id)
      toast.success('تم حذف الوكيل')
      onClose()
    } catch (error: any) {
      toast.error(`فشل الحذف: ${error.message}`)
    } finally {
      setIsDeleting(false)
    }
  }, [agent, removeStoreAgent, onAgentDeleted, onClose])

  // تغيير المزود -> تحديث النموذج تلقائياً
  const handleProviderChange = (value: string) => {
    const provider = value as ProviderKey
    const models = PROVIDERS[provider]?.models || []
    setFormData((prev) => ({
      ...prev,
      provider,
      model: models[0] || '',
    }))
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-md mx-auto">
        <DrawerHeader>
          <DrawerTitle>{agent?.id ? '✏️ تعديل الوكيل' : '🧑‍💻 وكيل جديد'}</DrawerTitle>
          <DrawerDescription>
            {agent?.id
              ? 'قم بتعديل شخصية الوكيل وإعداداته'
              : 'أنشئ وكيلاً جديداً بإعدادات مخصصة'}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* الصورة الرمزية */}
          <div className="space-y-2">
            <Label>الصورة الرمزية</Label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setFormData((f) => ({ ...f, avatar_emoji: emoji }))}
                  className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                    formData.avatar_emoji === emoji
                      ? 'border-indigo-500 bg-indigo-500/20'
                      : 'border-transparent hover:border-white/20'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* الاسم */}
          <div className="space-y-2">
            <Label htmlFor="agent-name">اسم الوكيل *</Label>
            <Input
              id="agent-name"
              value={formData.name || ''}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              placeholder="مثل: مساعد البحث"
            />
          </div>

          {/* المزود والنموذج */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="provider">المزود</Label>
              <Select
                value={formData.provider || 'openai'}
                onValueChange={handleProviderChange}
              >
                <SelectTrigger id="provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROVIDERS).map(([key, p]) => (
                    <SelectItem key={key} value={key}>
                      {p.icon} {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">النموذج</Label>
              <Select
                value={formData.model || ''}
                onValueChange={(value) => setFormData((f) => ({ ...f, model: value }))}
              >
                <SelectTrigger id="model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.provider &&
                    PROVIDERS[formData.provider as ProviderKey]?.models.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* التعليمات النظامية */}
          <div className="space-y-2">
            <Label htmlFor="system-prompt">التعليمات النظامية</Label>
            <Textarea
              id="system-prompt"
              value={formData.system_prompt || ''}
              onChange={(e) => setFormData((f) => ({ ...f, system_prompt: e.target.value }))}
              placeholder="أنت مساعد ذكي متخصص في..."
              rows={3}
            />
          </div>

          {/* درجة الحرارة */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>درجة الحرارة: {formData.temperature?.toFixed(2)}</Label>
            </div>
            <Slider
              value={[formData.temperature ?? 0.7]}
              onValueChange={([val]) => setFormData((f) => ({ ...f, temperature: val }))}
              min={0}
              max={2}
              step={0.05}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>دقيق</span>
              <span>إبداعي</span>
            </div>
          </div>

          {/* الحد الأقصى للرموز */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>الحد الأقصى للرموز: {formData.max_tokens}</Label>
            </div>
            <Slider
              value={[formData.max_tokens ?? 1000]}
              onValueChange={([val]) => setFormData((f) => ({ ...f, max_tokens: val }))}
              min={100}
              max={4000}
              step={50}
            />
          </div>

          {/* إحداثيات الموضع (للمستخدمين المتقدمين) */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div className="space-y-1">
              <Label className="text-xs">X (يسار-يمين)</Label>
              <Input
                type="number"
                value={formData.position_x ?? 0}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, position_x: parseFloat(e.target.value) || 0 }))
                }
                step={0.5}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Z (أمام-خلف)</Label>
              <Input
                type="number"
                value={formData.position_z ?? 0}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, position_z: parseFloat(e.target.value) || 0 }))
                }
                step={0.5}
              />
            </div>
          </div>
        </div>

        <DrawerFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={handleSave} disabled={isSaving} className="flex-1">
            {isSaving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
          </Button>
          {agent?.id && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? 'جاري الحذف...' : '🗑️ حذف الوكيل'}
            </Button>
          )}
          <DrawerClose asChild>
            <Button variant="outline" className="flex-1">إلغاء</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
