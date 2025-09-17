// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database functions
export const medicationsDB = {
  // Get all medications for current user
  async getUserMedications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data.map(item => ({ ...item.medication_data, dbId: item.id }))
  },

  // Add medication for current user
  async addMedication(medication) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_medications')
      .insert([{
        user_id: user.id,
        medication_data: medication
      }])
      .select()

    if (error) throw error
    return { ...medication, dbId: data[0].id }
  },

  // Remove medication for current user
  async removeMedication(dbId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('user_medications')
      .delete()
      .eq('id', dbId)
      .eq('user_id', user.id) // Extra security check

    if (error) throw error
  },

  // Clear all medications for current user
  async clearAllMedications() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('user_medications')
      .delete()
      .eq('user_id', user.id)

    if (error) throw error
  }
}