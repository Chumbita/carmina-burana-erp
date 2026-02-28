import { useState, useEffect } from "react"
import { inputService } from "../services/inputService"

export function useInputs() {
  const [inputs, setInputs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  //obtener insumos
  async function getInputs() {
    try {
        const data = await inputService.getAll()
        setInputs(data)
    } catch (error) {
      setError(error)
        throw new Error(`fallo al cargar los insumos error: ${error}` );       
    } finally {
        setLoading(false)
    }
    }
  
  useEffect(() => {
    getInputs()
  }, [])

  //crear insumos
  async function createInput(inputData) {
    try{
      const newInput = await inputService.create(inputData)
      setInputs(prev => [...prev, { ...newInput, estadoStock: 'critico',stockTotal: 0 }])
      return newInput
    } 
    catch (error) {
      setError(error)
      throw error
    }
  }

  //borrar insumos
  const deleteInput = async (id) => {
    setLoading(true)
    try {
      const response = await inputService.delete(id)
      setInputs(prev => prev.filter(i => i.id !== id))
      console.log(response);
              
      return true
    } catch (error) {
            setError(error)
      return false
    } finally {
      setLoading(false)
    }
  }

  // actualizar insumos
  async function updateInput(id, inputsData) {
    try {
      const inputUpdate = await inputService.patch(id, inputsData) 
      setInputs(prev => prev.map(i => i.id === id ? inputUpdate : i))
      return true  
      
    }catch (error) {
      console.error(error)
      setError(error)
      return false
    }
  }


  return {
    inputs,
    loading,
    error,
    getInputs,
    createInput,
    updateInput,
    deleteInput,
  }

}