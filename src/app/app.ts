import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Categoria } from './models/categoria.model';
import { Gasto } from './models/gasto.model';
import { GastoDetalle } from './models/gasto-detalle.model';
import { GastoFecha } from './models/gasto-fecha.model';
import { CategoriaService } from './services/categoria.service';
import Chart from 'chart.js/auto';
import { Usuario } from './models/usuario.model';
import { Ahorro } from './models/ahorro.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  categorias: Categoria[] = [];
  nuevoGasto: Gasto = { categoriaId: 0, descripcion: '', monto: 0 };
  gastosDetalle: GastoDetalle[] = [];
  categoriaSeleccionada: number | null = null;
  editandoPresupuesto: number | null = null;
  nuevoPresupuesto: number = 0;
  mostrandoGrafica: boolean = false;
  chart: any;
  mostrandoFiltro: boolean = false;
  fechaInicio: string = '';
  fechaFin: string = '';
  gastosFiltrados: GastoFecha[] = [];
  usuarioActual: Usuario | null = null;
  loginUsername: string = '';
  loginPassword: string = '';
  registroUsername: string = '';
  registroPassword: string = '';
  mostrandoRegistro: boolean = false;
  mostrandoNuevaCategoria: boolean = false;
  nuevaCategoriaNombre: string = '';
  nuevaCategoriaPresupuesto: number = 0;
  nomina: number = 0;
  periodo: string = 'quincenal';
  mostrandoNomina: boolean = false;
  recomendaciones: any[] = [];
  mostrandoBarras: boolean = false;
  chartBarras: any;
  categoriasSeleccionadas: number[] = [];
  ahorro: Ahorro = { meta: 0, acumulado: 0 };
  mostrandoAhorro: boolean = false;
  nuevaMetaAhorro: number = 0;
  mostrandoFormGasto: boolean = false;
  mostrandoReportes: boolean = false;
  reporteSemanal: any[] = [];
  reporteMensual: any[] = [];
  tipoReporte: string = 'mensual';

  constructor(
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.getCategorias(this.usuarioActual?.id).subscribe({
      next: (data) => {
        this.categorias = data;
        this.cdr.detectChanges();
        if (this.usuarioActual) {
          this.cargarAhorro();
        }
      },
      error: (err) => {
        console.error('Error al obtener categorias:', err);
      }
    });
  }

  agregarGasto(): void {
    if (this.nuevoGasto.categoriaId === 0 || !this.nuevoGasto.descripcion || this.nuevoGasto.monto <= 0) {
      alert('Completa todos los campos correctamente');
      return;
    }

    this.categoriaService.agregarGasto(this.nuevoGasto).subscribe({
      next: () => {
        this.nuevoGasto = { categoriaId: 0, descripcion: '', monto: 0 };
        this.mostrandoFormGasto = false;
        this.cargarCategorias();
      },
      error: (err) => {
        if (err.status === 400) {
          alert(err.error.error);
        } else {
          alert('Error al agregar gasto');
        }
      }
    });
  }

  verGastos(categoriaId: number): void {
    if (this.categoriaSeleccionada === categoriaId) {
      this.categoriaSeleccionada = null;
      this.gastosDetalle = [];
      return;
    }
    this.categoriaSeleccionada = categoriaId;
    this.categoriaService.getGastosPorCategoria(categoriaId).subscribe({
      next: (data) => {
        this.gastosDetalle = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al obtener gastos:', err);
      }
    });
  }

  cerrarGastos(): void {
    this.categoriaSeleccionada = null;
    this.gastosDetalle = [];
  }

  eliminarGasto(gastoId: number): void {
    if (confirm('¿Estás seguro de eliminar este gasto?')) {
      this.categoriaService.eliminarGasto(gastoId).subscribe({
        next: () => {
          this.cargarCategorias();
          if (this.categoriaSeleccionada) {
            this.verGastos(this.categoriaSeleccionada);
          }
        },
        error: (err) => {
          console.error('Error al eliminar gasto:', err);
          alert('Error al eliminar gasto');
        }
      });
    }
  }

  editarPresupuesto(categoria: Categoria): void {
    this.editandoPresupuesto = categoria.id;
    this.nuevoPresupuesto = categoria.presupuesto;
  }

  guardarPresupuesto(categoriaId: number): void {
    if (this.nuevoPresupuesto <= 0) {
      alert('El presupuesto debe ser mayor a 0');
      return;
    }

    this.categoriaService.actualizarPresupuesto(categoriaId, this.nuevoPresupuesto).subscribe({
      next: () => {
        this.editandoPresupuesto = null;
        this.cargarCategorias();
      },
      error: (err) => {
        console.error('Error al actualizar presupuesto:', err);
        alert('Error al actualizar presupuesto');
      }
    });
  }

  cancelarEdicion(): void {
    this.editandoPresupuesto = null;
  }

  mostrarGrafica(): void {
    const ctx = document.getElementById('graficaGastos') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const nombres = this.categorias.map(c => c.nombre);
    const gastados = this.categorias.map(c => c.gastado);
    const colores = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#4DC9F6'];

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: nombres,
        datasets: [{
          data: gastados,
          backgroundColor: colores,
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Distribución de Gastos',
            font: { size: 18 }
          }
        }
      }
    });
  }

  verGrafica(): void {
    this.mostrandoGrafica = !this.mostrandoGrafica;
    if (this.mostrandoGrafica) {
      setTimeout(() => this.mostrarGrafica(), 100);
    }
  }

  verFiltro(): void {
    this.mostrandoFiltro = !this.mostrandoFiltro;
    if (!this.mostrandoFiltro) {
      this.gastosFiltrados = [];
      this.fechaInicio = '';
      this.fechaFin = '';
    }
  }

  filtrarGastos(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      alert('Selecciona ambas fechas');
      return;
    }
    this.categoriaService.getGastosPorFecha(this.fechaInicio, this.fechaFin).subscribe({
      next: (data) => {
        this.gastosFiltrados = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al filtrar gastos:', err);
      }
    });
  }

  totalFiltrado(): number {
    return this.gastosFiltrados.reduce((suma, g) => suma + g.monto, 0);
  }

  getPorcentaje(categoria: Categoria): number {
    if (categoria.presupuesto === 0) return 0;
    return (categoria.gastado / categoria.presupuesto) * 100;
  }

  getClaseBarra(categoria: Categoria): string {
    const porcentaje = this.getPorcentaje(categoria);
    if (porcentaje >= 100) return 'barra-roja';
    if (porcentaje >= 75) return 'barra-amarilla';
    return 'barra-verde';
  }

  iniciarSesion(): void {
    this.categoriaService.login(this.loginUsername, this.loginPassword).subscribe({
      next: (response: any) => {
        this.usuarioActual = response.usuario;
        this.loginUsername = '';
        this.loginPassword = '';
        this.cargarCategorias();
      },
      error: (err) => {
        alert(err.error?.error || 'Error al iniciar sesión');
      }
    });
  }

  registrarse(): void {
    if (!this.registroUsername || !this.registroPassword) {
      alert('Completa todos los campos');
      return;
    }
    this.categoriaService.registro(this.registroUsername, this.registroPassword).subscribe({
      next: () => {
        alert('Usuario registrado. Ahora inicia sesión');
        this.mostrandoRegistro = false;
        this.registroUsername = '';
        this.registroPassword = '';
      },
      error: (err) => {
        alert(err.error?.error || 'Error al registrarse');
      }
    });
  }

  cerrarSesion(): void {
    this.usuarioActual = null;
    this.categorias = [];
    this.ahorro = { meta: 0, acumulado: 0 };
    this.cdr.detectChanges();
  }

  verNuevaCategoria(): void {
    this.mostrandoNuevaCategoria = !this.mostrandoNuevaCategoria;
    this.nuevaCategoriaNombre = '';
    this.nuevaCategoriaPresupuesto = 0;
  }

  crearCategoria(): void {
    if (!this.nuevaCategoriaNombre || this.nuevaCategoriaPresupuesto <= 0) {
      alert('Completa el nombre y el presupuesto');
      return;
    }
    this.categoriaService.crearCategoria(
      this.nuevaCategoriaNombre,
      this.nuevaCategoriaPresupuesto,
      this.usuarioActual!.id
    ).subscribe({
      next: () => {
        this.mostrandoNuevaCategoria = false;
        this.nuevaCategoriaNombre = '';
        this.nuevaCategoriaPresupuesto = 0;
        this.cargarCategorias();
      },
      error: (err) => {
        alert('Error al crear categoría');
      }
    });
  }

  verNomina(): void {
    this.mostrandoNomina = !this.mostrandoNomina;
    if (this.mostrandoNomina) {
      this.categoriasSeleccionadas = this.categorias.map(c => c.id);
      this.calcularRecomendaciones();
    }
  }

  calcularRecomendaciones(): void {
    if (this.categorias.length > 0) {
      const seleccionadas = this.categorias.filter(c => this.categoriasSeleccionadas.includes(c.id));
      if (seleccionadas.length > 0) {
        const porcentaje = 100 / seleccionadas.length;
        this.recomendaciones = seleccionadas.map(c => ({
          id: c.id,
          nombre: c.nombre,
          porcentaje: Math.round(porcentaje),
          monto: this.nomina * (porcentaje / 100)
        }));
      } else {
        this.recomendaciones = [];
      }
    } else {
      this.recomendaciones = [
        { nombre: 'Alimentacion', porcentaje: 30, monto: this.nomina * 0.30 },
        { nombre: 'Vivienda', porcentaje: 25, monto: this.nomina * 0.25 },
        { nombre: 'Transporte', porcentaje: 10, monto: this.nomina * 0.10 },
        { nombre: 'Salud', porcentaje: 10, monto: this.nomina * 0.10 },
        { nombre: 'Ahorro', porcentaje: 10, monto: this.nomina * 0.10 },
        { nombre: 'Educacion', porcentaje: 5, monto: this.nomina * 0.05 },
        { nombre: 'Entretenimiento', porcentaje: 5, monto: this.nomina * 0.05 },
        { nombre: 'Otros', porcentaje: 5, monto: this.nomina * 0.05 }
      ];
    }
  }

  aceptarRecomendacion(): void {
    if (this.nomina <= 0) {
      alert('Ingresa tu nómina primero');
      return;
    }

    if (this.categorias.length > 0) {
      this.categoriaService.distribuirNomina(
        this.usuarioActual!.id,
        this.nomina,
        this.categoriasSeleccionadas
      ).subscribe({
        next: () => {
          this.categoriaService.guardarNomina(this.usuarioActual!.id, this.nomina, this.periodo).subscribe({
            next: () => {
              this.usuarioActual!.nomina = this.nomina;
              this.usuarioActual!.periodo = this.periodo;
              this.cdr.detectChanges();
            }
          });
          this.mostrandoNomina = false;
          this.cargarCategorias();
        },
        error: () => alert('Error al distribuir la nómina')
      });
    } else {
      this.categoriaService.crearSobresRecomendados(this.usuarioActual!.id, this.nomina).subscribe({
        next: () => {
          this.categoriaService.guardarNomina(this.usuarioActual!.id, this.nomina, this.periodo).subscribe({
            next: () => {
              this.usuarioActual!.nomina = this.nomina;
              this.usuarioActual!.periodo = this.periodo;
              this.cdr.detectChanges();
            }
          });
          this.mostrandoNomina = false;
          this.cargarCategorias();
        },
        error: () => alert('Error al crear los sobres')
      });
    }
  }

  getNotificaciones(): string[] {
    const alertas: string[] = [];
    for (const cat of this.categorias) {
      const porcentaje = this.getPorcentaje(cat);
      if (porcentaje >= 100) {
        alertas.push(`El sobre "${cat.nombre}" ya se agotó`);
      } else if (porcentaje >= 75) {
        alertas.push(`El sobre "${cat.nombre}" está al ${Math.round(porcentaje)}%, cuidado`);
      }
    }
    return alertas;
  }

  verGraficaBarras(): void {
    this.mostrandoBarras = !this.mostrandoBarras;
    if (this.mostrandoBarras) {
      setTimeout(() => this.mostrarBarras(), 100);
    }
  }

  mostrarBarras(): void {
    const ctx = document.getElementById('graficaBarras') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chartBarras) {
      this.chartBarras.destroy();
    }

    const nombres = this.categorias.map(c => c.nombre);
    const presupuestos = this.categorias.map(c => c.presupuesto);
    const gastados = this.categorias.map(c => c.gastado);

    this.chartBarras = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: nombres,
        datasets: [
          {
            label: 'Presupuesto',
            data: presupuestos,
            backgroundColor: 'rgba(108, 92, 231, 0.7)',
            borderRadius: 6
          },
          {
            label: 'Gastado',
            data: gastados,
            backgroundColor: 'rgba(255, 107, 107, 0.7)',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Presupuesto vs Gastado',
            font: { size: 16 }
          },
          legend: {
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  toggleCategoriaSeleccion(id: number): void {
    const index = this.categoriasSeleccionadas.indexOf(id);
    if (index === -1) {
      this.categoriasSeleccionadas.push(id);
    } else {
      this.categoriasSeleccionadas.splice(index, 1);
    }
    this.calcularRecomendaciones();
  }

  cargarAhorro(): void {
    this.categoriaService.getAhorro(this.usuarioActual!.id).subscribe({
      next: (data: any) => {
        this.ahorro = { meta: data.meta || 0, acumulado: data.acumulado || 0 };
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al obtener ahorro:', err)
    });
  }

  verAhorro(): void {
    this.mostrandoAhorro = !this.mostrandoAhorro;
    this.nuevaMetaAhorro = this.ahorro.meta;
  }

  guardarMetaAhorro(): void {
    if (this.nuevaMetaAhorro <= 0) {
      alert('La meta debe ser mayor a 0');
      return;
    }
    this.categoriaService.guardarAhorro(this.usuarioActual!.id, this.nuevaMetaAhorro).subscribe({
      next: () => {
        this.ahorro.meta = this.nuevaMetaAhorro;
        this.mostrandoAhorro = false;
        this.cargarAhorro();
      },
      error: () => alert('Error al guardar meta de ahorro')
    });
  }

  moverSobranteAhorro(): void {
    if (confirm('¿Mover todo el sobrante de tus sobres al ahorro?')) {
      this.categoriaService.moverSobrante(this.usuarioActual!.id).subscribe({
        next: (response: any) => {
          this.cargarCategorias();
          this.cargarAhorro();
          alert(response.mensaje);
        },
        error: () => alert('Error al mover sobrante')
      });
    }
  }

  getPorcentajeAhorro(): number {
    if (this.ahorro.meta === 0) return 0;
    return (this.ahorro.acumulado / this.ahorro.meta) * 100;
  }

  verReportes(): void {
    this.mostrandoReportes = !this.mostrandoReportes;
    if (this.mostrandoReportes && this.usuarioActual) {
      this.cargarReporte();
    }
  }

  cargarReporte(): void {
    if (!this.usuarioActual) return;
    
    this.categoriaService.getReporteSemanal(this.usuarioActual.id).subscribe({
      next: (data) => {
        this.reporteSemanal = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error reporte semanal:', err)
    });
    
    this.categoriaService.getReporteMensual(this.usuarioActual.id).subscribe({
      next: (data) => {
        this.reporteMensual = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error reporte mensual:', err)
    });
  }

  getNombreMes(mes: number): string {
    const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes] || '';
  }

  totalMensual(): number {
    return this.reporteMensual.reduce((suma, r) => suma + r.totalGastado, 0);
  }

  totalSemanal(): number {
    return this.reporteSemanal.reduce((suma, r) => suma + r.totalGastado, 0);
  }

exportarPDF(): void {
  if (!this.usuarioActual) return;
  this.categoriaService.exportarPDF(this.usuarioActual.id).subscribe({
    next: (blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_kappta.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: () => alert('Error al exportar PDF')
  });
}

exportarExcel(): void {
  if (!this.usuarioActual) return;
  this.categoriaService.exportarExcel(this.usuarioActual.id).subscribe({
    next: (blob: any) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_kappta.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: () => alert('Error al exportar Excel')
  });
}
}