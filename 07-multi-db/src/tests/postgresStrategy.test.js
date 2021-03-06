const assert = require('assert')
const Postgres = require('../db/strategies/postgres/postgres')
const HeroiSchema = require('./../db/strategies/postgres/schemas/heroisSchema')
const Context = require('./../db/strategies/base/contextStrategy')


const MOCK_HEROI_CADASTRAR = {
    nome: 'Gavião Negro',
    poder: 'Flechas'
}
const MOCK_HEROI_ATUALIZAR = {
    nome: 'Batman',
    poder: 'Dinheiro'
}

let context = {}

describe('Postgres Strategy', function () {
    this.timeout(Infinity)
    this.beforeAll(async function () {
        const connection = await Postgres.connect() //conexao
        const model = await Postgres.defineModel(connection, HeroiSchema) //schema
        context = new Context(new Postgres(connection, model)) //constructor da classe Postgres recebendo a conexao e o schema
        await context.delete()
        await context.create(MOCK_HEROI_ATUALIZAR)
    })

    it('PostgresSQL Connection', async () => {
        const result = await context.isConnected()
        assert.deepEqual(result, true)
    })

    it('Cadastrar', async () => {
        const result = await context.create(MOCK_HEROI_CADASTRAR)
        delete result.id
        assert.deepEqual(result, MOCK_HEROI_CADASTRAR)
    })

    it('Listar', async () => {
        const [result] = await context.read({nome} = MOCK_HEROI_CADASTRAR)
        delete result.id
        assert.deepEqual(result, MOCK_HEROI_CADASTRAR)
    })

    it('Atualizar', async () => {
        const [itemAtualizar] = await context.read({nome} = MOCK_HEROI_ATUALIZAR)
        const novoItem = {
            ...MOCK_HEROI_ATUALIZAR,
            nome: 'Mulher Maravilha',
            poder: 'Deusa'
        }
        const [result] = await context.update(itemAtualizar.id, novoItem)
        const [itemAtualizado] = await context.read({id: itemAtualizar.id})
        assert.deepEqual(result, 1)
        assert.deepEqual(itemAtualizado.nome, novoItem.nome)
    })

    it('Remover por ID', async () => {
        const [item] = await context.read({})
        const result = await context.delete(item.id)
        assert.deepEqual(result, 1)
    })
})