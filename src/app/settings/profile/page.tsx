'use client'

import { useState, useEffect } from 'react'
import { useOpsMapStore } from '@/store'
import Link from 'next/link'
import {
  Building2,
  ArrowLeft,
  Save,
  Plus,
  X,
  Briefcase,
  Users,
  DollarSign,
  Target,
  MapPin,
  Wrench,
  AlertTriangle,
} from 'lucide-react'

const INDUSTRY_OPTIONS = [
  'Residential Remodeling',
  'Commercial Construction',
  'New Home Construction',
  'Kitchen & Bath',
  'Additions & Renovations',
  'Restoration',
  'Multi-Family',
  'Industrial',
  'Other',
]

const COMPANY_TYPE_OPTIONS = [
  'Design-Build',
  'General Contractor',
  'Specialty Contractor',
  'Trade Contractor',
  'Construction Manager',
  'Developer',
  'Other',
]

const SIZE_OPTIONS = [
  '1-5 employees',
  '6-20 employees',
  '21-50 employees',
  '51-100 employees',
  '100+ employees',
]

const REVENUE_OPTIONS = [
  'Under $500K',
  '$500K-1M',
  '$1M-5M',
  '$5M-10M',
  '$10M-25M',
  '$25M+',
]

export default function CompanyProfilePage() {
  const { companyProfile, updateCompanyProfile } = useOpsMapStore()

  const [formData, setFormData] = useState({
    industry: '',
    companyType: '',
    size: '',
    annualRevenue: '',
    targetMargin: 20,
    idealProject: '',
    serviceArea: '',
    specialties: [] as string[],
    challenges: '',
  })

  const [newSpecialty, setNewSpecialty] = useState('')
  const [saved, setSaved] = useState(false)

  // Load existing profile data
  useEffect(() => {
    if (companyProfile) {
      setFormData({
        industry: companyProfile.industry || '',
        companyType: companyProfile.companyType || '',
        size: companyProfile.size || '',
        annualRevenue: companyProfile.annualRevenue || '',
        targetMargin: companyProfile.targetMargin || 20,
        idealProject: companyProfile.idealProject || '',
        serviceArea: companyProfile.serviceArea || '',
        specialties: companyProfile.specialties || [],
        challenges: companyProfile.challenges || '',
      })
    }
  }, [companyProfile])

  const handleSave = () => {
    updateCompanyProfile(formData)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, newSpecialty.trim()],
      })
      setNewSpecialty('')
    }
  }

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty),
    })
  }

  return (
    <div className="min-h-full p-8" style={{ background: 'var(--cream)' }}>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/settings"
          className="inline-flex items-center gap-2 text-sm mb-4 hover:underline"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          Company Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          This information helps the AI provide tailored recommendations for your business
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Industry & Company Type */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ background: 'var(--mint)' }}>
              <Building2 className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Business Type
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Industry
              </label>
              <select
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  borderColor: 'var(--stone)',
                  background: 'var(--cream-light)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Select industry...</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Company Type
              </label>
              <select
                value={formData.companyType}
                onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  borderColor: 'var(--stone)',
                  background: 'var(--cream-light)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Select type...</option>
                {COMPANY_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Size & Revenue */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ background: 'var(--sand)' }}>
              <Users className="h-5 w-5" style={{ color: '#b8956e' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Company Size
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Team Size
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  borderColor: 'var(--stone)',
                  background: 'var(--cream-light)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Select size...</option>
                {SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Annual Revenue
              </label>
              <select
                value={formData.annualRevenue}
                onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  borderColor: 'var(--stone)',
                  background: 'var(--cream-light)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Select revenue...</option>
                {REVENUE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Financial Targets */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ background: 'var(--dusty-blue)' }}>
              <DollarSign className="h-5 w-5" style={{ color: '#3d4f5f' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Financial Targets
            </h2>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Target Profit Margin (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="50"
                value={formData.targetMargin}
                onChange={(e) => setFormData({ ...formData, targetMargin: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span
                className="w-16 px-3 py-1 text-center rounded-lg font-medium"
                style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
              >
                {formData.targetMargin}%
              </span>
            </div>
          </div>
        </div>

        {/* Ideal Project & Service Area */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ background: 'var(--mint)' }}>
              <Target className="h-5 w-5" style={{ color: 'var(--gk-green)' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Target Market
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Ideal Project Description
              </label>
              <textarea
                value={formData.idealProject}
                onChange={(e) => setFormData({ ...formData, idealProject: e.target.value })}
                placeholder="e.g., $100K-300K kitchen and bath remodels in upscale neighborhoods..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border resize-none"
                style={{
                  borderColor: 'var(--stone)',
                  background: 'var(--cream-light)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                <MapPin className="h-4 w-4 inline mr-1" />
                Service Area
              </label>
              <input
                type="text"
                value={formData.serviceArea}
                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                placeholder="e.g., Greater Austin area, 50-mile radius from downtown..."
                className="w-full px-4 py-2 rounded-lg border"
                style={{
                  borderColor: 'var(--stone)',
                  background: 'var(--cream-light)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ background: 'var(--sand)' }}>
              <Wrench className="h-5 w-5" style={{ color: '#b8956e' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Specialties
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSpecialty}
                onChange={(e) => setNewSpecialty(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSpecialty()}
                placeholder="Add a specialty..."
                className="flex-1 px-4 py-2 rounded-lg border"
                style={{
                  borderColor: 'var(--stone)',
                  background: 'var(--cream-light)',
                  color: 'var(--text-primary)',
                }}
              />
              <button
                onClick={addSpecialty}
                className="px-4 py-2 rounded-lg"
                style={{ background: 'var(--mint)', color: 'var(--gk-green-dark)' }}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {formData.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                    style={{ background: 'var(--cream)', color: 'var(--text-primary)' }}
                  >
                    {specialty}
                    <button
                      onClick={() => removeSpecialty(specialty)}
                      className="p-0.5 rounded-full hover:bg-black/10"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Challenges */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--white)', border: '1px solid var(--stone)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ background: '#fce8e0' }}>
              <AlertTriangle className="h-5 w-5" style={{ color: '#c4785a' }} />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Current Challenges
            </h2>
          </div>

          <textarea
            value={formData.challenges}
            onChange={(e) => setFormData({ ...formData, challenges: e.target.value })}
            placeholder="What are your biggest operational pain points? e.g., Struggling with lead qualification, change order management, subcontractor scheduling..."
            rows={4}
            className="w-full px-4 py-2 rounded-lg border resize-none"
            style={{
              borderColor: 'var(--stone)',
              background: 'var(--cream-light)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4">
          <div>
            {saved && (
              <span className="text-sm" style={{ color: 'var(--gk-green)' }}>
                ✓ Profile saved
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white"
            style={{ background: 'var(--gk-green)' }}
          >
            <Save className="h-5 w-5" />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  )
}
