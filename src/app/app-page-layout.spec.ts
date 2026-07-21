describe('app page layout', () => {
  let layout: HTMLDivElement;

  beforeEach(() => {
    layout = document.createElement('div');
    layout.classList.add('app-page-layout');
    document.body.appendChild(layout);
  });

  afterEach(() => {
    layout.remove();
  });

  it('applies the standard inset on every side', () => {
    const styles = getComputedStyle(layout);

    expect(styles.paddingTop).toBe('16px');
    expect(styles.paddingRight).toBe('16px');
    expect(styles.paddingBottom).toBe('16px');
    expect(styles.paddingLeft).toBe('16px');
    expect(styles.boxSizing).toBe('border-box');
  });

  it('supports an edge-to-edge page body', () => {
    layout.classList.add('app-page-layout--edge-to-edge');

    const styles = getComputedStyle(layout);

    expect(styles.paddingTop).toBe('0px');
    expect(styles.paddingRight).toBe('0px');
    expect(styles.paddingBottom).toBe('0px');
    expect(styles.paddingLeft).toBe('0px');
  });
});
