import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ApiService, ConciergeReply } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-concierge',
  standalone: true,
  imports: [CommonModule, FormsModule, TagModule, ButtonModule, InputTextModule, MessageModule, RouterLink],
  template: `
    <section class="page-hero">
      <div class="container-wide">
        <p-tag value="Naviq · AI Tourist Assistance" severity="success"></p-tag>
        <h1 class="page-title" style="color:#fff;margin-top:.6rem">Where AI meets deep domain expertise</h1>
        <p class="page-sub" style="color:rgba(255,255,255,.8)">Agentic guidance for disruptions, personalization, hotels, cruises, and loyalty — ask in plain language.</p>
      </div>
    </section>
    <div class="container-wide layout">
      <div class="chat card">
        @if (!auth.isLoggedIn()) {
          <p-message severity="warn" text="Sign in to chat with the concierge (any role)." styleClass="w-full mb"></p-message>
          <a routerLink="/login"><p-button label="Sign in"></p-button></a>
        } @else {
          <div class="prompts">
            @for (p of prompts; track p) {
              <button type="button" (click)="question=p; ask()">{{ p }}</button>
            }
          </div>
          <div class="ask">
            <input pInputText class="w-full" [(ngModel)]="question" (keyup.enter)="ask()" placeholder="Ask about hotels, cruises, delays, loyalty…" />
            <p-button label="Ask" icon="pi pi-sparkles" [loading]="loading" (onClick)="ask()"></p-button>
          </div>
          @if (reply) {
            <div class="reply">
              <small>{{ reply.mode }}</small>
              <p>{{ reply.answer }}</p>
              <div class="actions">
                @for (a of reply.suggestedActions; track a) {
                  <p-button [label]="a" size="small" [outlined]="true" (onClick)="runAction(a)"></p-button>
                }
              </div>
            </div>
          }
        }
      </div>
      <aside class="side card">
        <h3>Domain coverage</h3>
        <ul>
          <li>Passenger retail soft-sell</li>
          <li>iStay luxury hotels</li>
          <li>iTravel cruise packages</li>
          <li>Disruption re-accommodation</li>
          <li>iLoyal tier coaching</li>
          <li>iCargo lane awareness</li>
        </ul>
        <p-button label="Browse hotels" styleClass="w-full mb" [outlined]="true" (onClick)="go('/stays')"></p-button>
        <p-button label="Browse cruises" styleClass="w-full" [outlined]="true" (onClick)="go('/cruise')"></p-button>
      </aside>
    </div>
  `,
  styles: [`
    .page-hero { background:linear-gradient(120deg,#04161a,#0b3d38 50%,#12324f); padding:2.4rem 0 2rem; margin-bottom:1.25rem; }
    .layout { display:grid; grid-template-columns:1.5fr .7fr; gap:1.1rem; padding-bottom:2rem; }
    .prompts { display:flex; flex-wrap:wrap; gap:.45rem; margin-bottom:1rem; }
    .prompts button { border:1px solid var(--gray-300); background:#fff; border-radius:999px; padding:.4rem .75rem; font-size:.78rem; cursor:pointer; font-weight:650; }
    .prompts button:hover { border-color:var(--teal); color:var(--teal-dark); }
    .ask { display:flex; gap:.55rem; }
    .w-full { width:100%; }
    .mb { margin-bottom:1rem; display:block; }
    .reply { margin-top:1.1rem; background:var(--gray-100); border-radius:14px; padding:1rem 1.1rem; }
    .reply small { color:#667; font-weight:650; }
    .reply p { margin:.45rem 0 .85rem; line-height:1.55; }
    .actions { display:flex; flex-wrap:wrap; gap:.45rem; }
    .side h3 { margin:0 0 .75rem; color:var(--navy); }
    .side ul { margin:0 0 1.1rem; padding-left:1.1rem; color:#445; line-height:1.7; font-size:.92rem; }
    @media (max-width:900px) { .layout { grid-template-columns:1fr; } .ask { flex-direction:column; } }
  `]
})
export class ConciergeComponent {
  question = 'Plan a honeymoon with hotel + cruise from Dubai';
  loading = false;
  reply: ConciergeReply | null = null;
  prompts = [
    'Best luxury hotel near DXB',
    'Family cruise in Asia',
    'Flight delayed — what should I do?',
    'How do I reach Diamond tier?',
    'Hottest cargo lanes this week'
  ];

  constructor(private api: ApiService, public auth: AuthService, private router: Router) {}

  ask() {
    if (!this.auth.isLoggedIn() || !this.question.trim()) return;
    this.loading = true;
    this.api.askConcierge(this.question.trim()).subscribe({
      next: r => { this.reply = r; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  go(path: string) { this.router.navigate([path]); }

  runAction(a: string) {
    const x = a.toLowerCase();
    if (x.includes('hotel') || x.includes('stay') || x.includes('suite') || x.includes('maldives')) this.go('/stays');
    else if (x.includes('cruise') || x.includes('shore') || x.includes('cabin')) this.go('/cruise');
    else if (x.includes('loyalty') || x.includes('partner') || x.includes('tier')) this.go('/loyalty');
    else if (x.includes('cargo') || x.includes('pharma')) this.go('/cargo');
    else if (x.includes('tracker') || x.includes('flight') || x.includes('alternate')) this.go('/search');
    else this.question = a;
  }
}
