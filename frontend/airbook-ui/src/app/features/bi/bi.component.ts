import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ApiService, DashboardPayload } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-bi',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, CardModule, TagModule,
    InputTextModule, MessageModule, ProgressSpinnerModule
  ],
  template: `
    <div class="container bi-page">
      <div class="hero">
        <div>
          <p-tag [value]="auth.isAdmin() ? 'ADMIN · ANALYTICS' : 'ANALYST WORKSPACE'" severity="info"></p-tag>
          <h1>AI Retail BI Command Center</h1>
          <p>Live OOSD KPIs, demand signals, FX, and natural-language retail analyst — restricted to ADMIN & ANALYST.</p>
        </div>
        <p-button label="Refresh" icon="pi pi-refresh" [outlined]="true" (onClick)="refresh()"></p-button>
      </div>

      @if (error) {
        <p-message severity="error" [text]="error" styleClass="w-full"></p-message>
      } @else if (!dash && loading) {
        <div class="loading"><p-progressSpinner strokeWidth="3" /></div>
      } @else if (dash) {
        <div class="kpi-grid">
          <div class="kpi"><span>GMV</span><strong>₹{{ dash.kpis.grossMerchandiseValue | number }}</strong></div>
          <div class="kpi"><span>Orders</span><strong>{{ dash.kpis.totalOrders }}</strong></div>
          <div class="kpi"><span>AOV</span><strong>₹{{ dash.kpis.averageOrderValue | number }}</strong></div>
          <div class="kpi"><span>Settle %</span><strong>{{ dash.kpis.settlementRate }}%</strong></div>
          <div class="kpi"><span>Check-in %</span><strong>{{ dash.kpis.checkInRate }}%</strong></div>
          <div class="kpi"><span>Ancillary attach</span><strong>{{ dash.kpis.ancillaryAttachRate }}%</strong></div>
        </div>

        <div class="charts">
          <p-card header="Revenue trend (14d)"><canvas #revChart></canvas></p-card>
          <p-card header="OOSD funnel"><canvas #funnelChart></canvas></p-card>
        </div>

        <div class="split">
          <p-card header="AI Insights">
            @for (i of insights; track i.title) {
              <div class="insight">
                <div class="insight-top">
                  <strong>{{ i.title }}</strong>
                  <p-tag [value]="((i.confidence * 100) | number:'1.0-0') + '%'" severity="success"></p-tag>
                </div>
                <p>{{ i.detail }}</p>
              </div>
            }
            @if (!insights.length) { <p class="muted">No insights yet.</p> }
          </p-card>

          <p-card header="Ask the Retail Analyst">
            <div class="ask-row">
              <input pInputText class="w-full" [(ngModel)]="question" placeholder="e.g. How is ancillary attach performing?" />
              <p-button label="Ask AI" icon="pi pi-sparkles" [loading]="asking" (onClick)="ask()"></p-button>
            </div>
            @if (answer) {
              <div class="answer">
                <small>Mode: {{ answerMode }}</small>
                <p>{{ answer }}</p>
              </div>
            }
            <h4>Demand forecast</h4>
            <div class="forecast-row">
              <input pInputText [(ngModel)]="fcOrigin" maxlength="3" class="iata" />
              <input pInputText [(ngModel)]="fcDest" maxlength="3" class="iata" />
              <p-button label="Run" [outlined]="true" (onClick)="forecast()"></p-button>
            </div>
            @if (forecastData) {
              <p class="muted">Live demand {{ forecastData.liveDemandScore }}/100 · model {{ forecastData.model }}</p>
              <ul>
                @for (h of forecastData.horizon; track h.dayOffset) {
                  <li>D+{{ h.dayOffset }}: {{ h.demandIndex }} ({{ h.pricingBias }})</li>
                }
              </ul>
            }
          </p-card>
        </div>

        @if (dash.topRoutes?.length) {
          <p-card header="Top routes by revenue">
            <div class="routes">
              @for (r of dash.topRoutes; track r.routeKey) {
                <div class="route-row">
                  <strong>{{ r.routeKey }}</strong>
                  <span>{{ r.bookings }} bookings</span>
                  <span>₹{{ r.revenue | number }}</span>
                </div>
              }
            </div>
          </p-card>
        }
      }
    </div>
  `,
  styles: [`
    .bi-page { display:grid; gap:1.1rem; }
    .hero { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;
      background: linear-gradient(120deg, #071526, #0f3a4a 60%, #0a5548);
      color:#fff; border-radius:18px; padding:1.4rem 1.5rem; }
    .hero h1 { margin:.45rem 0 .35rem; font-size:1.65rem; }
    .hero p { margin:0; opacity:.78; max-width:560px; }
    .kpi-grid { display:grid; grid-template-columns: repeat(6, 1fr); gap:0.85rem; }
    .kpi { background:#fff; border:1px solid var(--gray-300); border-radius:14px; padding:1rem; }
    .kpi span { display:block; font-size:0.75rem; color:#667; }
    .kpi strong { font-size:1.15rem; color:var(--navy); }
    .charts { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .split { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .insight { border-bottom:1px solid var(--gray-300); padding:0.75rem 0; }
    .insight:last-child { border-bottom:none; }
    .insight-top { display:flex; justify-content:space-between; gap:.5rem; margin-bottom:0.25rem; align-items:center; }
    .ask-row { display:flex; gap:.5rem; margin-bottom:1rem; }
    .w-full { width:100%; }
    .answer { margin-top:.5rem; background:var(--gray-100); padding:0.85rem; border-radius:10px; }
    .answer small { color:#667; }
    h4 { margin:1.25rem 0 .6rem; color:var(--navy); }
    .forecast-row { display:flex; gap:0.5rem; margin-bottom:0.75rem; align-items:center; }
    .iata { width:72px; text-transform:uppercase; }
    .muted { color:#667; font-size:.9rem; }
    .loading { display:flex; justify-content:center; padding:3rem; }
    .routes { display:grid; gap:.55rem; }
    .route-row { display:grid; grid-template-columns:1.2fr 1fr 1fr; gap:.5rem; padding:.55rem 0; border-bottom:1px solid var(--gray-300); }
    @media (max-width:900px) { .kpi-grid,.charts,.split { grid-template-columns:1fr; } .ask-row { flex-direction:column; } }
  `]
})
export class BiComponent implements OnInit, AfterViewInit {
  @ViewChild('revChart') revRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('funnelChart') funnelRef?: ElementRef<HTMLCanvasElement>;

  dash: DashboardPayload | null = null;
  insights: any[] = [];
  error = '';
  loading = false;
  question = 'Where should we push yield this week?';
  answer = ''; answerMode = ''; asking = false;
  fcOrigin = 'COK'; fcDest = 'DXB'; forecastData: any = null;
  private chartsReady = false;
  private revChart?: Chart;
  private funnelChart?: Chart;

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit() { this.refresh(); }
  ngAfterViewInit() { this.chartsReady = true; this.renderCharts(); }

  refresh() {
    this.error = '';
    this.loading = true;
    this.api.getDashboard().subscribe({
      next: d => { this.dash = d; this.loading = false; setTimeout(() => this.renderCharts()); },
      error: () => { this.error = 'Analytics denied — ADMIN or ANALYST role required'; this.loading = false; }
    });
    this.api.getAiInsights().subscribe({ next: i => this.insights = i, error: () => {} });
  }

  ask() {
    this.asking = true; this.answer = '';
    this.api.askAi(this.question).subscribe({
      next: r => { this.answer = r.answer; this.answerMode = r.mode; this.asking = false; },
      error: () => { this.answer = 'AI request failed'; this.asking = false; }
    });
  }

  forecast() {
    this.api.getDemandForecast(this.fcOrigin, this.fcDest).subscribe({
      next: f => this.forecastData = f,
      error: () => this.error = 'Forecast failed'
    });
  }

  private renderCharts() {
    if (!this.dash || !this.chartsReady || !this.revRef || !this.funnelRef) return;
    this.revChart?.destroy();
    this.funnelChart?.destroy();
    this.revChart = new Chart(this.revRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.dash.revenueTrend.map(p => p.date.slice(5)),
        datasets: [{
          label: 'Revenue (INR)',
          data: this.dash.revenueTrend.map(p => p.revenue),
          borderColor: '#00b4a0',
          backgroundColor: 'rgba(0,180,160,0.15)',
          fill: true,
          tension: 0.35
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
    this.funnelChart = new Chart(this.funnelRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.dash.oosdFunnel.map(f => f.stage),
        datasets: [{
          label: 'Volume',
          data: this.dash.oosdFunnel.map(f => f.count),
          backgroundColor: ['#0a1628', '#132238', '#00b4a0', '#009688']
        }]
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
    });
  }
}
