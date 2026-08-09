import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { ApiService, DashboardPayload } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-bi',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="head">
        <div>
          <h2>AI Retail BI Command Center</h2>
          <p>Live OOSD KPIs, demand signals (OpenSky), FX (Frankfurter), and AI analyst.</p>
        </div>
        <button class="btn btn-outline" (click)="refresh()">Refresh</button>
      </div>

      @if (!auth.isLoggedIn()) {
        <div class="alert-error">Login required for BI. Use <a routerLink="/login">admin&#64;airbook.com / admin123</a></div>
      } @else if (error) {
        <div class="alert-error">{{ error }}</div>
      } @else if (dash) {
        <div class="kpi-grid">
          <div class="kpi card"><span>GMV</span><strong>₹{{ dash.kpis.grossMerchandiseValue | number }}</strong></div>
          <div class="kpi card"><span>Orders</span><strong>{{ dash.kpis.totalOrders }}</strong></div>
          <div class="kpi card"><span>AOV</span><strong>₹{{ dash.kpis.averageOrderValue | number }}</strong></div>
          <div class="kpi card"><span>Settle %</span><strong>{{ dash.kpis.settlementRate }}%</strong></div>
          <div class="kpi card"><span>Check-in %</span><strong>{{ dash.kpis.checkInRate }}%</strong></div>
          <div class="kpi card"><span>Ancillary attach</span><strong>{{ dash.kpis.ancillaryAttachRate }}%</strong></div>
        </div>

        <div class="charts">
          <div class="card"><h3>Revenue trend (14d)</h3><canvas #revChart></canvas></div>
          <div class="card"><h3>OOSD funnel</h3><canvas #funnelChart></canvas></div>
        </div>

        <div class="split">
          <div class="card">
            <h3>AI Insights</h3>
            @for (i of insights; track i.title) {
              <div class="insight">
                <div class="insight-top"><strong>{{ i.title }}</strong><span>{{ (i.confidence * 100) | number:'1.0-0' }}%</span></div>
                <p>{{ i.detail }}</p>
              </div>
            }
          </div>
          <div class="card">
            <h3>Ask the Retail Analyst</h3>
            <div class="form-group"><input [(ngModel)]="question" placeholder="e.g. How is ancillary attach performing?"></div>
            <button class="btn btn-primary" (click)="ask()" [disabled]="asking">{{ asking ? 'Thinking...' : 'Ask AI' }}</button>
            @if (answer) {
              <div class="answer">
                <small>Mode: {{ answerMode }}</small>
                <p>{{ answer }}</p>
              </div>
            }
            <h4 style="margin-top:1.25rem">Demand forecast</h4>
            <div class="forecast-row">
              <input [(ngModel)]="fcOrigin" maxlength="3">
              <input [(ngModel)]="fcDest" maxlength="3">
              <button class="btn btn-outline" (click)="forecast()">Run</button>
            </div>
            @if (forecastData) {
              <p>Live demand {{ forecastData.liveDemandScore }}/100 · model {{ forecastData.model }}</p>
              <ul>
                @for (h of forecastData.horizon; track h.dayOffset) {
                  <li>D+{{ h.dayOffset }}: {{ h.demandIndex }} ({{ h.pricingBias }})</li>
                }
              </ul>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .head { display:flex; justify-content:space-between; gap:1rem; align-items:flex-start; margin-bottom:1.25rem; }
    h2 { color: var(--navy); margin-bottom:0.25rem; }
    .kpi-grid { display:grid; grid-template-columns: repeat(6, 1fr); gap:0.85rem; margin-bottom:1.25rem; }
    .kpi span { display:block; font-size:0.75rem; color:#667; }
    .kpi strong { font-size:1.15rem; color:var(--navy); }
    .charts { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.25rem; }
    .split { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .insight { border-bottom:1px solid var(--gray-300); padding:0.75rem 0; }
    .insight-top { display:flex; justify-content:space-between; margin-bottom:0.25rem; }
    .answer { margin-top:1rem; background:var(--gray-100); padding:0.85rem; border-radius:8px; }
    .forecast-row { display:flex; gap:0.5rem; margin-bottom:0.75rem; }
    .forecast-row input { width:70px; padding:0.5rem; border:1px solid var(--gray-300); border-radius:6px; }
    @media (max-width:900px) { .kpi-grid,.charts,.split { grid-template-columns:1fr; } }
  `]
})
export class BiComponent implements OnInit, AfterViewInit {
  @ViewChild('revChart') revRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('funnelChart') funnelRef?: ElementRef<HTMLCanvasElement>;

  dash: DashboardPayload | null = null;
  insights: any[] = [];
  error = '';
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
    if (!this.auth.isLoggedIn()) return;
    this.error = '';
    this.api.getDashboard().subscribe({
      next: d => { this.dash = d; setTimeout(() => this.renderCharts()); },
      error: () => this.error = 'Failed to load analytics dashboard'
    });
    this.api.getAiInsights().subscribe({ next: i => this.insights = i });
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
