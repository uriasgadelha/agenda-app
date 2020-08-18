import { MatSnackBar } from '@angular/material/snack-bar';
import { ContatoDetalheComponent } from './../contato-detalhe/contato-detalhe.component';
import { Contato } from './Contato';
import { ContatoService } from './../contato.service';
import { Component, OnInit, NgModule } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';



@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent implements OnInit {

  formulario : FormGroup;
  contatos: Contato[] = [];
  colunas = ['foto', 'id', 'nome', 'email', 'favorito'];
  
  totalElementos = 0;
  pagina = 0;
  tamanho = 10;
  pageSizeOptions : number[] = [2, 5, 10];


  constructor(
    private service : ContatoService,
    private fb : FormBuilder,
    private dialog : MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {    
    this.listarContatos(this.pagina, this.tamanho);
    this.montarFormulario();
  }

  montarFormulario() {
    this.formulario = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.email, Validators.required]]
    })
  }

  listarContatos( pagina, tamanho ) {
    this.service.list(pagina, tamanho)
    .subscribe( response => {
      this.contatos = response.content;
      this.totalElementos = response.totalElements;
      this.pagina = response.number;
    })
  }

  favoritar(contato: Contato) {
    this.service.favoritar(contato).subscribe(r => {
      contato.favorito = !contato.favorito;
    })
  }
  
  submit(){
    const formValues = this.formulario.value;
    const contato: Contato = new Contato(formValues.nome, formValues.email)
    this.service.save(contato).subscribe(
      resposta => {
        this.listarContatos(this.pagina, this.tamanho);        
        this.snackBar.open('Contato Adicionado!', 'Sucesso', {duration: 2000});
        this.formulario.reset();
      }
    )
  }

  uploadFoto(event, contato) {
    const files = event.target.files;
    if (files) {
      const foto = files[0];
      const formData = new FormData();
      formData.append("foto",foto);
      this.service.upload(contato, formData)
      .subscribe( r =>
        this.listarContatos(this.pagina, this.tamanho));
    }
  }

  visualizarContato(contato : Contato) {
    this.dialog.open(
      ContatoDetalheComponent, {
      width: '400px',
      height: '450px',
      data: contato
      }      
    )
  }

  paginar(event: PageEvent) {
    this.pagina = event.pageIndex;
    this.tamanho = event.pageSize;
    this.listarContatos(this.pagina, this.tamanho);
  }

}
