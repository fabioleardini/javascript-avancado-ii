class NegociacaoService {

    constructor() {

        this._http = new HttpService();
    }

    obterNegociacoesDaSemana(cb) {

        return new Promise((resolve, reject) => {
            
            this._http
                .get('negociacoes/semana')
                .then(negociacoes => {
                    resolve(negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor)));
                })
                .catch(error => {
                    console.log(error);
                    reject('Nao foi possivel obter as negociacoes da semana')
                })
        });
    }

    obterNegociacoesDaSemanaAnterior(cb) {

        return new Promise((resolve, reject) => {
            
            this._http
                .get('negociacoes/anterior')
                .then(negociacoes => {
                    resolve(negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor)));
                })
                .catch(error => {
                    console.log(error);
                    reject('Nao foi possivel obter as negociacoes da semana anterior')
                })
        });
    }

    obterNegociacoesDaSemanaRetrasada(cb) {

        return new Promise((resolve, reject) => {
            
            this._http
                .get('negociacoes/retrasada')
                .then(negociacoes => {
                    resolve(negociacoes.map(objeto => new Negociacao(new Date(objeto.data), objeto.quantidade, objeto.valor)));
                })
                .catch(error => {
                    console.log(error);
                    reject('Nao foi possivel obter as negociacoes da semana retrasada')
                })
        });    
    }

    obterNegociacoes() {
        
        return Promise.all([
            this.obterNegociacoesDaSemana(),
            this.obterNegociacoesDaSemanaAnterior(),
            this.obterNegociacoesDaSemanaRetrasada()
        ]).then(periodos => {

            let negociacoes = periodos
                .reduce((dados, periodo) => dados.concat(periodo), [])
                .map(dado => new Negociacao(new Date(dado.data), dado.quantidade, dado.valor ));

            return negociacoes;
        }).catch(erro => {
            throw new Error(erro);
        });
    }
    
    cadastra(negocicao) {

        return ConnectionFactory
            .getConnection()
            .then(connection => new NegociacaoDao(connection))
            .then(dao => dao.adiciona(negociacao))
            .then(() => 'Negociação adicionada com sucesso')
            .catch(error => {
                console.log(error);
                throw new Error('Não foi possível adicionar a negociação');
            });
    }

    lista() {

        return ConnectionFactory
            .getConnection()
            .then(connection => new NegociacaoDao(connection))
            .then(dao => dao.listaTodos())
            .catch(error => {
                console.log(error);
                throw new Error('Não foi possível obter as negociações');
            });
    }

    apaga() {

        return ConnectionFactory
            .getConnection()
            .then(connection => new NegociacaoDao(connection))
            .then(dao => dao.apagaTodos())
            .then(() => 'Negociações apagadas com sucesso')
            .catch(error => {
                console.log(error);
                throw new Error('Não foi possível apagar as negociações');
            });
    }

    importa(listaAtual) {

        return this.obterNegociacoes()
            .then(negociacoes => 
                negociacoes.filter(negociacao => 
                    !listaAtual.some(negociacaoExistente => 
                        JSON.stringify(negociacao == JSON.stringify(negociacaoExistente)))
                )
            )
            .catch(error => {
                console.log(error);
                throw new Error('Não foi possível buscar negociações para importar');
            });
    }
}