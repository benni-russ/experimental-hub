import { useState } from 'react';
import type { Card as CardData } from '@hub/shared';
import { useCreateOwnCard, useDeleteOwnCard, useOwnCards } from '../api';
import { Button } from '../design/components/Button';
import { FlipCard } from '../design/components/FlipCard';
import { Icon } from '../design/components/Icon';
import { CardPager } from './CardPager';

function FlippableCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <FlipCard
      flipped={flipped}
      onFlip={() => setFlipped((f) => !f)}
      front={<p className="card-text">{front}</p>}
      back={<p className="card-text">{back}</p>}
    />
  );
}

export function CardList({ projectId, cards }: { projectId: string; cards: CardData[] }) {
  const own = useOwnCards(projectId);
  const create = useCreateOwnCard();
  const remove = useDeleteOwnCard();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    create.mutate(
      { projectId, front, back },
      {
        onSuccess: () => {
          setFront('');
          setBack('');
        },
      },
    );
  }

  return (
    <div className="cards">
      <CardPager
        items={cards}
        getKey={(c) => c.id}
        label="Karten"
        renderItem={(c) => <FlippableCard front={c.front} back={c.back} />}
      />

      {own.isError ? (
        <p className="field-error" role="alert">
          Eigene Karten konnten nicht geladen werden ({own.error.message}).
        </p>
      ) : null}
      {own.data && own.data.length > 0 ? (
        <div className="own-cards">
          <h3>Eigene Karten</h3>
          <CardPager
            items={own.data}
            getKey={(c) => c.id}
            label="Eigene Karten"
            renderItem={(c) => (
              <>
                <FlippableCard front={c.front} back={c.back} />
                <Button
                  variant="quiet"
                  className="card-delete"
                  aria-label="Karte löschen"
                  title="Karte löschen"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (window.confirm('Diese Karte löschen?')) {
                      remove.mutate({ id: c.id, projectId });
                    }
                  }}
                >
                  <Icon name="trash" size={20} />
                </Button>
              </>
            )}
          />
          {remove.isError ? (
            <p className="field-error" role="alert">
              Nicht gelöscht: {remove.error.message}
            </p>
          ) : null}
        </div>
      ) : null}

      <form className="own-card-form" onSubmit={submit}>
        <h3>Eigene Karte hinzufügen</h3>
        <div className="field">
          <label htmlFor="own-front">Vorderseite (Frage)</label>
          <textarea
            id="own-front"
            className="input textarea"
            rows={2}
            required
            aria-required="true"
            value={front}
            onChange={(e) => setFront(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="own-back">Rückseite (Antwort)</label>
          <textarea
            id="own-back"
            className="input textarea"
            rows={2}
            required
            aria-required="true"
            value={back}
            onChange={(e) => setBack(e.target.value)}
          />
        </div>
        {create.isError ? (
          <p className="field-error" role="alert">
            {create.error.message}
          </p>
        ) : null}
        <Button type="submit" disabled={create.isPending}>
          Karte hinzufügen
        </Button>
      </form>
    </div>
  );
}
