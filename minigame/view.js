class DrawButton extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = props.onClick;
  }

  click() {
    this.onClick(this.props.count);
  }

  render() {
    return e(
      'button',
      {
        className: 'mdc-button mdc-button--raised mdc-card__action mdc-card__action--button',
        onClick: () => { this.click() }
      },
      e('span', { className: 'mdc-button__ripple' }),
      this.props.count == 1? `Draw 1 time`: `Draw ${this.props.count} times`
    );
  }
}

class Box extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return e(
      'div',
      { className: 'mdc-card__actions' },
      this.props.btns
    );
  }
}

class ItemImage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let rare;
    switch (this.props.item.rarity) {
      case 1:
        rare = 'r r1';
        break;
      case 2:
        rare = 'r r2';
        break;
      case 3:
        rare = 'r r3';
        break;
    }
    return e(
      'div',
      {
        className: 'mdc-card__media mdc-card__media--square ' + rare
      },
      e('div',
        {
          className: 'mdc-card__media-content',
          style: {
            //backgroundImage: 'url(https://material.io/develop/images/material-logo-outline.svg)',
            backgroundSize: '100%',
            backgroundRepeat: 'no-repeat'
          }
        },
        this.props.isNew ? e('span', null, "New") : null
      )
    )
  }
}

class ItemView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return e(
      'div',
      {
        key: Math.random(),
        className: "mdc-layout-grid__cell mdc-layout-grid__cell--span-1 mdc-elevation--z5 ani",
        style: { animationDelay: `${this.props.idx * 20}ms` }
      },
      e(
        'div',
        {
          className: "mdc-card"
        },
        e(ItemImage, { item: this.props.item, isNew: this.props.isNew }),
        e(
          'div',
          { className: 'card-content mdc-typography mdc-typography--body2' },
          this.props.item.name
        )
      )
    );
  }
}

class DrawResult extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const items = this.props.items.map((item, i) => e(ItemView, { item: item.item, isNew: item.isNew, idx: i }));
    console.log(items);
    return e(
      'div',
      { className: 'mdc-layout-grid' },
      e(
        'div',
        { className: 'mdc-layout-grid__inner' },
        items
      )
    );
  }
}

class Summary extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const count = this.props.prog.total;
    const items = this.props.prog.getUniqueItems();
    const total = this.props.prog.getPoolSize();
    return e(
      'div',
      null,
      `总次数${count} 已获得 ${items} / ${total}`
    );
  }
}

class LotteryInfoView extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const lottery = this.props.lottery;
    const prob = (lottery.lottery.prob * 100).toFixed(2);
    const items = lottery.getUniqueItems();
    const total = lottery.getPoolSize();
    const mean = lottery.getMean().toFixed(0);
    const median = lottery.getMedian();

    return e(
      'div',
      null,
      `${lottery.lottery.name} ${prob}% 已获得 ${items} / ${total} 抽齐期望${mean}次 中位数${median}次`
    );
  }
}

class SummaryCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const lots = [];
    for (let i in this.props.inventory.lotteries) {
      lots.push(e(LotteryInfoView, {lottery: this.props.inventory.lotteries[i]}));
    }
    return e(
      'div',
      {
        className: "mdc-card"
      },
      e(Summary, { prog: this.props.inventory.total }),
      lots
    );
  }
}


