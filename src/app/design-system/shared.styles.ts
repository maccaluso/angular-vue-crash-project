// ---------------------------------------------------------------------
// Classi CSS condivise tra più componenti (titoli, testo secondario,
// bottoni). Non è un file .css globale: è una STRINGA TypeScript che
// ogni componente importa e passa al proprio "styles" array:
//
//   styles: [sharedStyles, `/* regole specifiche di questo componente */`]
//
// Perché così invece di un normale styles.css condiviso: un foglio CSS
// globale funzionerebbe solo con ViewEncapsulation.Emulated (il default
// di oggi). Se un giorno questo progetto passasse a ShadowDom (vedi
// manuale, §7 dell'esperimento), un CSS globale smetterebbe di
// raggiungere gli elementi dentro ogni shadow root — esattamente il
// problema che ci ha rotto styles.css durante quell'esperimento.
// Con questo pattern, il CSS resta scritto UNA VOLTA sola (niente
// copia-incolla tra componenti), ma finisce comunque fisicamente
// duplicato dentro ogni componente che lo importa — quindi funziona
// identico sia con Emulated sia con ShadowDom, senza modifiche.
export const sharedStyles = `
  .page-title {
    margin: 0;
    font-size: var(--ds-text-xl);
    line-height: var(--ds-text-xl-lh);
    font-weight: var(--ds-font-semibold);
    color: var(--ds-color-text-strong);
  }

  .hint {
    margin: 0.75rem 0 0;
    font-size: var(--ds-text-sm);
    color: var(--ds-color-text-secondary);
  }

  .error {
    margin: 0.25rem 0 0;
    font-size: var(--ds-text-sm);
    color: var(--ds-color-danger);
  }

  .summary {
    margin: 0.25rem 0 0;
    font-size: var(--ds-text-sm);
    color: var(--ds-color-text-subtle);
  }

  .summary strong {
    font-weight: var(--ds-font-medium);
    color: var(--ds-color-text-body);
  }

  .btn {
    display: inline-block;
    box-sizing: border-box;
    border: 1px solid transparent;
    border-radius: var(--ds-radius-md);
    padding: 0.5rem 1rem;
    font-size: var(--ds-text-sm);
    font-weight: var(--ds-font-medium);
    line-height: var(--ds-text-sm-lh);
    cursor: pointer;
    transition:
      background-color 0.15s,
      border-color 0.15s,
      color 0.15s;
  }

  .btn--sm {
    padding: 0.25rem 0.625rem;
    font-size: var(--ds-text-xs);
    line-height: var(--ds-text-xs-lh);
  }

  .btn--primary {
    background: var(--ds-color-text-strong);
    color: var(--ds-color-surface);
  }
  .btn--primary:hover {
    background: var(--ds-color-text-secondary);
  }
  .btn--primary:disabled {
    background: var(--ds-color-border-strong);
    cursor: not-allowed;
  }

  .btn--secondary {
    border-color: var(--ds-color-border-strong);
    background: var(--ds-color-surface);
    color: var(--ds-color-text-body);
  }
  .btn--secondary:hover {
    background: var(--ds-color-bg);
  }

  .btn--danger-ghost {
    border-color: var(--ds-color-border);
    background: var(--ds-color-surface);
    color: var(--ds-color-text-secondary);
  }
  .btn--danger-ghost:hover {
    border-color: var(--ds-color-danger-border);
    background: var(--ds-color-danger-bg);
    color: var(--ds-color-danger);
  }
`;
