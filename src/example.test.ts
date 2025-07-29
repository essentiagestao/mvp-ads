import { describe, it, expect } from 'vitest'

describe('Teste básico', () => {
  it('deve somar corretamente', () => {
    const resultado = 2 + 2
    expect(resultado).toBe(4)
  })

  it('deve retornar string correta', () => {
    const nome = 'Essentia'
    expect(nome).toContain('ss')
  })
})
