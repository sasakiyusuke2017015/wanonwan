import { describe, expect, it } from 'vitest';

import {
  calculateDropdownPosition,
  transformOriginFromTrigger,
  type TriggerRect,
} from './calculatePosition';

// trigger は (100, 50) - (180, 80) の 80x30 のボックスとして共通利用
const trigger: TriggerRect = { left: 100, top: 50, right: 180, bottom: 80 };
const menu = { width: 200, height: 120 };
const offset = 8;

describe('calculateDropdownPosition', () => {
  it('bottom-start: trigger 下、trigger の left に揃える', () => {
    expect(calculateDropdownPosition(trigger, menu, 'bottom-start', offset)).toEqual({
      top: 88,   // trigger.bottom + offset = 80 + 8
      left: 100, // trigger.left
    });
  });

  it('bottom-end: trigger 下、trigger の right に揃える', () => {
    expect(calculateDropdownPosition(trigger, menu, 'bottom-end', offset)).toEqual({
      top: 88,
      left: -20, // trigger.right - menu.width = 180 - 200
    });
  });

  it('top-start: trigger 上、trigger の left に揃える', () => {
    expect(calculateDropdownPosition(trigger, menu, 'top-start', offset)).toEqual({
      top: -78, // trigger.top - offset - menu.height = 50 - 8 - 120
      left: 100,
    });
  });

  it('top-end: trigger 上、trigger の right に揃える', () => {
    expect(calculateDropdownPosition(trigger, menu, 'top-end', offset)).toEqual({
      top: -78,
      left: -20,
    });
  });

  it('right-start: trigger 右、trigger の top に揃える', () => {
    expect(calculateDropdownPosition(trigger, menu, 'right-start', offset)).toEqual({
      top: 50,   // trigger.top
      left: 188, // trigger.right + offset = 180 + 8
    });
  });

  it('right-end: trigger 右、trigger の bottom に揃える', () => {
    expect(calculateDropdownPosition(trigger, menu, 'right-end', offset)).toEqual({
      top: -40, // trigger.bottom - menu.height = 80 - 120
      left: 188,
    });
  });

  it('left-start: trigger 左、trigger の top に揃える', () => {
    expect(calculateDropdownPosition(trigger, menu, 'left-start', offset)).toEqual({
      top: 50,
      left: -108, // trigger.left - offset - menu.width = 100 - 8 - 200
    });
  });

  it('left-end: trigger 左、trigger の bottom に揃える', () => {
    expect(calculateDropdownPosition(trigger, menu, 'left-end', offset)).toEqual({
      top: -40,
      left: -108,
    });
  });

  it('offset が 0 でも矛盾なく計算できる', () => {
    expect(calculateDropdownPosition(trigger, menu, 'bottom-start', 0)).toEqual({
      top: 80, // trigger.bottom + 0
      left: 100,
    });
  });

  it('offset が大きい値でも線形に反映される', () => {
    expect(calculateDropdownPosition(trigger, menu, 'bottom-start', 100)).toEqual({
      top: 180,
      left: 100,
    });
  });

  describe('viewport clamp', () => {
    const viewport = { width: 400, height: 300 };
    const margin = 8;

    it('viewport 未指定なら clamp 無し (後方互換)', () => {
      // bottom-end は left = trigger.right - menu.width = -20 になる
      expect(calculateDropdownPosition(trigger, menu, 'bottom-end', offset)).toEqual({
        top: 88,
        left: -20,
      });
    });

    it('viewport 指定で left が margin より小さい場合は margin に clamp', () => {
      // bottom-end raw: left = -20, top = 88
      expect(
        calculateDropdownPosition(trigger, menu, 'bottom-end', offset, viewport, margin),
      ).toEqual({
        top: 88,
        left: margin, // -20 → 8 にクランプ
      });
    });

    it('viewport 指定で left が右端を超える場合は viewport.width - menu.width - margin に clamp', () => {
      // trigger を viewport 右端近くに置く: left=300, right=380 (viewport width=400)
      // bottom-start raw: left = 300
      // clamp 上限: 400 - 200 - 8 = 192
      const rightTrigger: TriggerRect = { left: 300, top: 50, right: 380, bottom: 80 };
      expect(
        calculateDropdownPosition(rightTrigger, menu, 'bottom-start', offset, viewport, margin),
      ).toEqual({
        top: 88,
        left: 192,
      });
    });

    it('viewport 指定で top が viewport 下端を超える場合は clamp', () => {
      // trigger を viewport 下端近くに置く: top=250, bottom=280 (viewport height=300)
      // bottom-start raw: top = 280 + 8 = 288
      // clamp 上限: 300 - 120 - 8 = 172
      const bottomTrigger: TriggerRect = { left: 100, top: 250, right: 180, bottom: 280 };
      expect(
        calculateDropdownPosition(bottomTrigger, menu, 'bottom-start', offset, viewport, margin),
      ).toEqual({
        top: 172,
        left: 100,
      });
    });

    it('viewport 指定で top が margin より小さい場合は margin に clamp', () => {
      // top-start raw: top = -78 (trigger.top=50, offset=8, menu.height=120 → 50-8-120)
      expect(
        calculateDropdownPosition(trigger, menu, 'top-start', offset, viewport, margin),
      ).toEqual({
        top: margin,
        left: 100,
      });
    });

    it('viewport 指定で viewportMargin が 0 でも clamp が走る (vp 端ジャストまで)', () => {
      // bottom-end raw: left = -20 → 0 にクランプ
      expect(
        calculateDropdownPosition(trigger, menu, 'bottom-end', offset, viewport, 0),
      ).toEqual({
        top: 88,
        left: 0,
      });
    });

    describe('avoidTriggerOverlap', () => {
      it('top-start: clamp が trigger に被せそうなときは trigger 上に固定 (上にはみ出す)', () => {
        // 画面下端の trigger から縦長 menu を上開き
        // bottomTrigger top=250, bottom=280 / menu height=120 / viewport height=300
        const bottomTrigger: TriggerRect = { left: 100, top: 250, right: 180, bottom: 280 }
        // raw top = 250 - 8 - 120 = 122 (収まる) なので overlap は起きないケース
        // → 縦長 menu に差し替えて raw が viewport に収まらない状況を作る
        const tallMenu = { width: 200, height: 280 }
        // raw top = 250 - 8 - 280 = -38 → 通常 clamp で min(8) に戻ると bottom=8+280=288>250 で被る
        // avoidTriggerOverlap=true なら top = trigger.top - offset - height = -38 のまま
        expect(
          calculateDropdownPosition(
            bottomTrigger, tallMenu, 'top-start', offset, viewport, margin, 0, true,
          ).top,
        ).toBe(-38)
      })

      it('false (default) なら従来どおり margin に clamp して trigger に被る', () => {
        const bottomTrigger: TriggerRect = { left: 100, top: 250, right: 180, bottom: 280 }
        const tallMenu = { width: 200, height: 280 }
        expect(
          calculateDropdownPosition(
            bottomTrigger, tallMenu, 'top-start', offset, viewport, margin,
          ).top,
        ).toBe(margin)
      })
    })

    it('menu が viewport より大きいときは min (margin) を返す (max < min の縮退ケース)', () => {
      // menu.width 500 > viewport.width 400 - margin*2 → max が min を下回る
      const bigMenu = { width: 500, height: 120 };
      expect(
        calculateDropdownPosition(trigger, bigMenu, 'bottom-start', offset, viewport, margin),
      ).toEqual({
        top: 88,
        left: margin, // 縮退で min (margin) を返す
      });
    });
  });
});

describe('transformOriginFromTrigger', () => {
  it('trigger 中心が menu のローカル座標になる (menu が trigger の真下)', () => {
    // trigger center: ((100+180)/2, (50+80)/2) = (140, 65)
    // menu pos: (100, 88) (bottom-start 例)
    // origin = (140-100, 65-88) = (40, -23)
    expect(transformOriginFromTrigger(trigger, { top: 88, left: 100 })).toBe('40px -23px');
  });

  it('menu の bottom-end 配置 (trigger 右下に menu の右上)', () => {
    // menu pos: bottom-end → (88, 180-200= -20)
    // origin = (140 - (-20), 65 - 88) = (160, -23)
    expect(transformOriginFromTrigger(trigger, { top: 88, left: -20 })).toBe('160px -23px');
  });

  it('menu が trigger の上 (top-start) のとき、origin の y は menu 下端付近になる', () => {
    // top-start: top = -78, left = 100
    // origin = (140-100, 65-(-78)) = (40, 143)
    expect(transformOriginFromTrigger(trigger, { top: -78, left: 100 })).toBe('40px 143px');
  });

  it('menu が trigger の右 (right-start) のとき、origin の x は負になる', () => {
    // right-start: top = 50, left = 188
    // origin = (140 - 188, 65 - 50) = (-48, 15)
    expect(transformOriginFromTrigger(trigger, { top: 50, left: 188 })).toBe('-48px 15px');
  });
});
