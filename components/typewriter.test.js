import React from 'react';
import { Text } from 'react-native';
import { mount } from 'enzyme';
import TypeWriter from './typewriter';

describe('<TypeWriter />', () => {
  test('does not type by default', () => {
    const wrapper = mount(
      <TypeWriter>
        This text is invisible.
      </TypeWriter>
    );

    expect(wrapper.text()).toEqual('');
  });

  describe('typing', () => {
    jest.useFakeTimers();

    test('starts after 200ms by default', () => {
      const wrapper = mount(
        <TypeWriter typing={1} minDelay={5} maxDelay={10}>
          This text will be typed.
        </TypeWriter>
      );

      jest.advanceTimersByTime(200);
      wrapper.update();

      expect(wrapper.text()).toEqual('T');
    });

    test('cancels its timeout on unmount', () => {
      jest.spyOn(global, 'clearTimeout');

      const wrapper = mount(
        <TypeWriter initialDelay={0} minDelay={5} maxDelay={10} typing={1}>
          Hello World!
        </TypeWriter>
      );

      jest.advanceTimersByTime(4);

      wrapper.unmount();

      expect(global.clearTimeout).toHaveBeenCalled();
    });

    test('starts typing immediately', () => {
      const wrapper = mount(
        <TypeWriter initialDelay={0} typing={1}>
          Typed immediately.
        </TypeWriter>
      );

      jest.advanceTimersByTime(0);
      wrapper.update();

      expect(wrapper.text()).toEqual('T');
    });

    test('continues typing within the min and max delay times', () => {
      const wrapper = mount(
        <TypeWriter typing={1} minDelay={50} maxDelay={55}>
          Typed every 50-100ms.
        </TypeWriter>
      );

      jest.advanceTimersByTime(255);
      wrapper.update();

      expect(wrapper.text()).toEqual('Ty');

      jest.advanceTimersByTime(220);
      wrapper.update();

      expect(wrapper.text()).toEqual('Typed ');

      jest.advanceTimersByTime(825);
      wrapper.update();

      expect(wrapper.contains(
        <Text style={{ display: 'none' }} />
      )).toEqual(false);
    });

    test('can stop typing', () => {
      const wrapper = mount(
        <TypeWriter initialDelay={0} minDelay={50} maxDelay={50} typing={1}>
          This will stop typing after half a second.
        </TypeWriter>
      );

      jest.advanceTimersByTime(500);
      wrapper.setProps({ typing: 0 });
      wrapper.update();

      expect(wrapper.text()).toEqual('This will s');

      jest.advanceTimersByTime(50);
      wrapper.update();

      expect(wrapper.text()).toEqual('This will s');
    });

    test('can type backwards', () => {
      const wrapper = mount(
        <TypeWriter initialDelay={0} minDelay={5} maxDelay={5} typing={1}>
          Hello world!
        </TypeWriter>
      );

      jest.advanceTimersByTime(65);
      wrapper.update();

      expect(wrapper.text()).toEqual('Hello world!');

      wrapper.setProps({ typing: -1 });
      wrapper.update();

      expect(wrapper.text()).toEqual('Hello world');

      jest.advanceTimersByTime(5);
      wrapper.update();

      expect(wrapper.text()).toEqual('Hello worl');
    });

    test('#onTyped', () => {
      const onTyped = jest.fn();
      mount(
        <TypeWriter
          initialDelay={0}
          minDelay={5}
          maxDelay={5}
          onTyped={onTyped}
          typing={1}
        >
          Hello World!
        </TypeWriter>
      );

      jest.advanceTimersByTime(5);

      expect(onTyped).toHaveBeenCalledWith('H', 1);
    });

    test('#onTypingEnd', () => {
      const onTypingEnd = jest.fn();
      mount(
        <TypeWriter
          initialDelay={0}
          minDelay={5}
          maxDelay={5}
          onTypingEnd={onTypingEnd}
          typing={1}
        >
          short
        </TypeWriter>
      );

      jest.advanceTimersByTime(25);

      expect(onTypingEnd).toHaveBeenCalled();
    });
  });

  describe('fixed', () => {
    test('makes the un-typed portion of the string invisible to maintain full width', () => {
      const children = `This is a longer string that we want typewriter to print
        and maintain its full width so it doesn't shift around on the screen.`;
      const wrapper = mount(
        <TypeWriter fixed initialDelay={0} minDelay={5} maxDelay={5} typing={1}>
          {children}
        </TypeWriter>
      );

      jest.advanceTimersByTime(9);
      wrapper.update();

      expect(wrapper.contains(
        <Text style={{ color: 'transparent' }}>
          {children.slice(2)}
        </Text>
      )).toEqual(true);
    });
  });

  describe('delay map', () => {
    test('applies an extra delay when matching the index', () => {
      const delayMap = [{
        at: 2,
        delay: 450
      }];
      const wrapper = mount(
        <TypeWriter
          delayMap={delayMap}
          initialDelay={0}
          minDelay={5}
          maxDelay={5}
          typing={1}
        >
          Hello World!
        </TypeWriter>
      );

      jest.advanceTimersByTime(5);
      wrapper.update();

      expect(wrapper.text()).toEqual('He');

      jest.advanceTimersByTime(455);
      wrapper.update();

      expect(wrapper.text()).toEqual('Hel');

      jest.advanceTimersByTime(10);
      wrapper.update();

      expect(wrapper.text()).toEqual('Hello');
    });

    test('applies an extra delay to a matching string', () => {
      const delayMap = [{
        at: 'l',
        delay: 250
      }];
      const wrapper = mount(
        <TypeWriter
          delayMap={delayMap}
          initialDelay={0}
          minDelay={5}
          maxDelay={5}
          typing={1}
        >
          Hello World!
        </TypeWriter>
      );

      jest.advanceTimersByTime(5);
      wrapper.update();

      expect(wrapper.text()).toEqual('He');

      jest.advanceTimersByTime(255);
      wrapper.update();

      expect(wrapper.text()).toEqual('Hel');

      jest.advanceTimersByTime(255);
      wrapper.update();

      expect(wrapper.text()).toEqual('Hell');

      jest.advanceTimersByTime(5);
      wrapper.update();

      expect(wrapper.text()).toEqual('Hello');
    });

    test('applies an extra delay when matching a pattern', () => {
      const delayMap = [{
        at: /[aeiou]/,
        delay: 200
      }];
      const wrapper = mount(
        <TypeWriter
          delayMap={delayMap}
          initialDelay={0}
          minDelay={5}
          maxDelay={5}
          typing={1}
        >
          Hello World!
        </TypeWriter>
      );

      jest.advanceTimersByTime(0);
      wrapper.update();

      expect(wrapper.text()).toEqual('H');

      jest.advanceTimersByTime(205);
      wrapper.update();

      expect(wrapper.text()).toEqual('He');

      jest.advanceTimersByTime(10);
      wrapper.update();

      expect(wrapper.text()).toEqual('Hell');

      jest.advanceTimersByTime(205);
      wrapper.update();

      expect(wrapper.text()).toEqual('Hello');

      jest.advanceTimersByTime(10);
      wrapper.update();

      expect(wrapper.text()).toEqual('Hello W');
    });
  });

  test('maintains nested Text elements', () => {
    const wrapper = mount(
      <TypeWriter initialDelay={0} minDelay={1} maxDelay={1} typing={1}>
        Hello
        {' '}
        <Text style={{ color: 'red' }}>World!</Text>
      </TypeWriter>
    );

    jest.advanceTimersByTime(5);
    wrapper.update();
    const colorText = wrapper.find({ style: { color: 'red' } });

    expect(colorText).toBeDefined();
    expect(colorText.last().text()).toEqual('');

    jest.advanceTimersByTime(2);
    wrapper.update();

    expect(wrapper.find({ style: { color: 'red' } }).last().text()).toEqual('Wo');
  });

  test('handles nested Text elements anywhere in the children', () => {
    const wrapper = mount(
      <TypeWriter initialDelay={0} minDelay={1} maxDelay={1} typing={1}>
        Hello
        {' '}
        <Text style={{ color: 'red' }}>World!</Text>
        {' '}
        This is from TypeWriter.
      </TypeWriter>
    );

    jest.advanceTimersByTime(36);
    wrapper.update();


    expect(wrapper.text()).toEqual('Hello World! This is from TypeWriter.');
    expect(wrapper.containsMatchingElement(
      <Text style={{ color: 'red' }}>World!</Text>
    )).toBe(true);
  });
});
