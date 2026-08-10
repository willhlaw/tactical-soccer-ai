import { describe, it, expect, beforeEach } from 'vitest';
import { getRightWingOverlapAttackPlay } from '../services/aiScenarioEngine';

describe('Right-Wing Overlap & Box Entry Attack 5-Sequence Play', () => {
  let playData: ReturnType<typeof getRightWingOverlapAttackPlay>;

  beforeEach(() => {
    playData = getRightWingOverlapAttackPlay();
  });

  it('verifies 5 distinct keyframe sequences exist in chronological order', () => {
    expect(playData.keyframes).toBeDefined();
    expect(playData.keyframes?.length).toBe(5);

    const timestamps = playData.keyframes?.map(k => k.timestamp);
    expect(timestamps).toEqual([0.0, 2.0, 4.0, 6.0, 8.0]);
  });

  it('Sequence 1: CM passes through ball to RW, RW runs, ST moves forward, CM moves to 30yd line', () => {
    const seq1 = playData.keyframes![0];
    expect(seq1.label).toContain('CM Through Pass to RW');

    const cm = seq1.nodes.find(n => n.role === 'CM');
    const rw = seq1.nodes.find(n => n.role === 'RW');
    const st = seq1.nodes.find(n => n.role === 'ST');

    expect(cm?.y).toBe(35); // CM runs up to 30-yard offensive end
    expect(st?.y).toBe(15); // ST moves slightly in front of goal
    expect(rw?.x).toBe(82); // RW runs on to ball
    expect(seq1.balls[0]).toEqual({ id: 'ball-1', x: 82, y: 30 });
  });

  it('Sequence 2: RW dribbles to end line, CM runs to 18yd box edge', () => {
    const seq2 = playData.keyframes![1];
    const rw = seq2.nodes.find(n => n.role === 'RW');
    const cm = seq2.nodes.find(n => n.role === 'CM');

    expect(rw?.x).toBe(85);
    expect(rw?.y).toBe(15); // Close to end line
    expect(cm?.x).toBe(50);
    expect(cm?.y).toBe(25); // Edge of 18-yard box
    expect(seq2.balls[0]).toEqual({ id: 'ball-1', x: 85, y: 15 });
  });

  it('Sequence 3: Cutback pass from RW to CM at 18yd box', () => {
    const seq3 = playData.keyframes![2];
    expect(seq3.balls[0]).toEqual({ id: 'ball-1', x: 50, y: 25 });
    expect(seq3.arrows[0].type).toBe('pass');
  });

  it('Sequence 4: CM shoots at goal', () => {
    const seq4 = playData.keyframes![3];
    expect(seq4.arrows[0].type).toBe('shot');
    expect(seq4.arrows[0].endY).toBe(2);
  });

  it('Sequence 5: Ball is in net (GOAL!)', () => {
    const seq5 = playData.keyframes![4];
    expect(seq5.balls[0]).toEqual({ id: 'ball-1', x: 50, y: 2 });
  });

  it('verifies 1-Click Share Link base64 encoding & decoding payload integrity', () => {
    const jsonString = JSON.stringify(playData);
    const encoded = encodeURIComponent(btoa(jsonString));
    const decodedJson = atob(decodeURIComponent(encoded));
    const restored = JSON.parse(decodedJson);

    expect(restored.title).toBe('Right-Wing Overlap & Box Entry Attack');
    expect(restored.keyframes.length).toBe(5);
    expect(restored.keyframes[4].balls[0]).toEqual({ id: 'ball-1', x: 50, y: 2 });
  });
});
