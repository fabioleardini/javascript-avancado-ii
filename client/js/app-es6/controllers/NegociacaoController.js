import {ListaNegociacoes} from '..models/ListaNegociacoes';
import {Mensagem} from '..models/ListaNegociacoes';
import {NegociacoesView} from '..view/NegociacoesView';
import {MensagemView} from '..view/MensagemView';
import {NegociacaoService} from '..service/NegociacaoService';
import {DateHelper} from '..helpers/DateHelper';
import {Bind} from '..helpers/Bind';
import {Negociacao} from '..models/Negociacao';

class NegociacaoController {
    
    constructor() {
        
        let $ = document.querySelector.bind(document);
        this._inputData = $('#data');
        this._inputQuantidade = $('#quantidade');
        this._inputValor = $('#valor');

        this._listaNegociacoes = new Bind(
            new ListaNegociacoes(),
            new NegociacoesView($('#negociacoesView')),
            'adiciona', 'esvazia', 'ordena', 'inverteOrdem');
        
        this._mensagem = new Bind(
            new Mensagem(), 
            new MensagemView($('#mensagemView')), 
            'texto');

        this._oredemAtual = '';

        this._service = new NegociacaoService();

        this._init();
    }

    _init() {        

        this._service
            .lista()
            .then(negociacoes =>
                negociacoes.forEach(negociacao => 
                    this._listaNegociacoes.adiciona(negociacao)))
            .catch(erro => this._mensagem.texto = erro);

        setInterval(() => {
            this.importaNegociacoes();
        }, 3000);
    }
    
    adiciona(event) {

        event.preventDefault();

        let negocicao = this._criaNegociacao();

        this._service
            .cadastra(negocicao)
            .then(mensagem => {
                this._listaNegociacoes.adiciona(negocicao);
                this._mensagem.texto = mensagem;
                this._limpaFormulario();
            })
            .catch(error => this._mensagem.texto = error);
    }

    importaNegociacoes() {

        this._service
            .importa(this._listaNegociacoes.negociacoes)
            .then(negociacoes => negociacoes.forEach(negociacao => {
                this._listaNegociacoes.adiciona(negociacao);
                this._mensagem.texto = 'Negociações do período importadas';
            }))
            .catch(error => this._mensagem.texto = error);
    }

    apaga() {

        this._service
            .apaga()
            .then(mensagem => {
                this._mensagem.text = mensagem;
                this._listaNegociacoes.esvazia();
            })
            .catch(error => this._mensagem.texto = erro);
    }

    ordena(coluna) {
        
        if(this._ordemAtual == coluna) {
            this._listaNegociacoes.inverteOrdem();
        } else {
            this._listaNegociacoes.ordena((a, b) => a[coluna] - b[coluna]);
        }
        
        this._ordemAtual = coluna;
    }
    
    _criaNegociacao() {
        
        return new Negociacao(
            DateHelper.textoParaData(this._inputData.value),
            parseInt(this._inputQuantidade.value),
            parseFloat(this._inputValor.value));
    }
    
    _limpaFormulario() {
     
        this._inputData.value = '';
        this._inputQuantidade.value = 1;
        this._inputValor.value = 0.0;
        this._inputData.focus();   
    }
}

let negociacaoController = new NegociacaoController();
export function currentInstance() {

    return negociacaoController;
}