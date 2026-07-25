import { Injectable, inject } from '@angular/core';

import { BehaviorSubject, map, Observable } from 'rxjs';

import { ExpertDraftService } from 'src/app/features/calculator/services/expert-draft.service';
import { PrefsStorage } from 'src/app/shared/services/prefs-storage.service';

import type { Dough } from '../interfaces/dough.interface';

export const DOUGHS_STORAGE_KEY = 'calculator:doughs';

/** The document library for named Dough snapshots (ADR-0002). */
@Injectable({ providedIn: 'root' })
export class DoughsService {
  private readonly prefs = inject(PrefsStorage);
  private readonly state = inject(ExpertDraftService);
  private readonly doughs = new BehaviorSubject<Dough[]>(this.read());

  getDoughs$(): Observable<Dough[]> {
    return this.doughs.pipe(map((doughs) => this.cloneList(doughs)));
  }

  list(): Dough[] {
    return this.cloneList(this.doughs.value);
  }

  get(id: string): Dough | null {
    const dough = this.doughs.value.find((item) => item.id === id);
    return dough ? this.clone(dough) : null;
  }

  nameExists(name: string): boolean {
    const normalized = name.trim().toLocaleLowerCase();
    return this.doughs.value.some(
      (dough) => dough.name.toLocaleLowerCase() === normalized,
    );
  }

  /** Saves a snapshot of the Expert Draft; later edits cannot mutate it. */
  saveDraft(name: string): Dough {
    const now = new Date().toISOString();
    const dough: Dough = {
      id: this.createId(),
      name: this.requireName(name),
      input: { ...this.state.getInput() },
      createdAt: now,
      updatedAt: now,
    };

    this.persist([...this.doughs.value, dough]);
    return this.clone(dough);
  }

  rename(id: string, name: string): boolean {
    const nextName = name.trim();
    if (!nextName) {
      return false;
    }

    let renamed = false;
    const now = new Date().toISOString();
    const next = this.doughs.value.map((dough) => {
      if (dough.id !== id) {
        return dough;
      }
      renamed = true;
      return { ...dough, name: nextName, updatedAt: now };
    });

    if (renamed) {
      this.persist(next);
    }
    return renamed;
  }

  duplicate(id: string, name: string): Dough | null {
    const source = this.doughs.value.find((dough) => dough.id === id);
    if (!source) {
      return null;
    }

    const now = new Date().toISOString();
    const copy: Dough = {
      id: this.createId(),
      name: this.requireName(name),
      input: { ...source.input },
      createdAt: now,
      updatedAt: now,
    };
    this.persist([...this.doughs.value, copy]);
    return this.clone(copy);
  }

  delete(id: string): boolean {
    const next = this.doughs.value.filter((dough) => dough.id !== id);
    if (next.length === this.doughs.value.length) {
      return false;
    }
    this.persist(next);
    return true;
  }

  /** Loads a copy into the Expert Draft; the saved Dough stays immutable. */
  adjust(id: string): boolean {
    const dough = this.doughs.value.find((item) => item.id === id);
    if (!dough) {
      return false;
    }
    this.state.replaceWithCopy(dough.input);
    return true;
  }

  private persist(doughs: Dough[]): void {
    const snapshots = this.cloneList(doughs);
    this.prefs.set(DOUGHS_STORAGE_KEY, snapshots);
    this.doughs.next(snapshots);
  }

  private read(): Dough[] {
    return this.cloneList(this.prefs.get<Dough[]>(DOUGHS_STORAGE_KEY) ?? []);
  }

  private clone(dough: Dough): Dough {
    return { ...dough, input: { ...dough.input } };
  }

  private cloneList(doughs: Dough[]): Dough[] {
    return doughs.map((dough) => this.clone(dough));
  }

  private requireName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('A Dough name is required.');
    }
    return trimmed;
  }

  private createId(): string {
    let id: string;
    do {
      id = `dough-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
    } while (this.doughs.value.some((dough) => dough.id === id));
    return id;
  }
}
