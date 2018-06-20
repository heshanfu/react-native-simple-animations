import React, { Component } from 'react';
import { getSpringAnimation, getTimingAnimation } from '../util/get-animation';

import { AIMS } from '../constants/aims';
import { Animated } from 'react-native';
import { DEFAULT_PROPS } from '../constants/default-props';
import { DIRECTIONS } from '../constants/directions';
import { MOVEMENT_TYPES } from '../constants/movement-types';
import { PROP_TYPES } from '../constants/prop-types';
import { STATIC_TYPES } from '../constants/static-types';

export class SimpleAnimation extends Component {

    constructor(props) {
        super(props);

        this.opacityAnimation = new Animated.Value(0);
        this.movementAnimation = new Animated.Value(0);
        this.staticAnimation = new Animated.Value(0);
    }

    static defaultProps = DEFAULT_PROPS

    static propTypes = PROP_TYPES

    componentDidMount = () => {
        this.animate();
    }

    componentDidUpdate = () => {
        const { animateOnUpdate } = this.props;
        if (animateOnUpdate) this.animate();
    }

    animate = () => {
        const { aim, animate, fade, movementType, staticType } = this.props;

        if (!animate) return;

        const fromValue = aim === AIMS.IN ? 0 : 1;
        const toValue = aim === AIMS.IN ? 1 : 0;

        if (fade) {
            const opacityAnimation = getTimingAnimation;
            this.opacityAnimation.setValue(fromValue);
            opacityAnimation({ animation: this.opacityAnimation, toValue, ...this.props }).start();
        }

        if (movementType) {
            const movementAnimation = movementType === MOVEMENT_TYPES.SPRING ? getSpringAnimation : getTimingAnimation;
            this.movementAnimation.setValue(fromValue);
            movementAnimation({ animation: this.movementAnimation, toValue, ...this.props }).start();
        }

        if (staticType) {
            const staticAnimation = staticType === STATIC_TYPES.BOUNCE ? getSpringAnimation : getTimingAnimation;
            this.staticAnimation.setValue(fromValue);
            staticAnimation({ animation: this.staticAnimation, toValue, ...this.props }).start();
        }
    }

    getDistanceStartValue = () => {
        const { direction, distance } = this.props;

        switch (direction) {
            case DIRECTIONS.DOWN: return -distance;
            case DIRECTIONS.LEFT: return distance;
            case DIRECTIONS.RIGHT: return -distance;
            case DIRECTIONS.UP: return distance;

            default: return 0;
        }
    }

    getOpacity = () => {
        const { fade } = this.props;

        if (!fade) return {};
        return { opacity: this.opacityAnimation };
    }

    getMovementTransform = () => {
        const { direction } = this.props;

        if (!direction) return [];

        const outputRangeStartValue = this.getDistanceStartValue();

        const interpolatedAnimation = this.movementAnimation.interpolate({
            inputRange: [ 0, 1 ],
            outputRange: [ outputRangeStartValue, 0 ]
        });

        const transform = [
            (direction === DIRECTIONS.LEFT || direction === DIRECTIONS.RIGHT)
                ? { translateX: interpolatedAnimation }
                : { translateY: interpolatedAnimation }
        ];

        return transform;
    }

    getStaticTransform = () => {
        const { staticType } = this.props;

        if (!staticType) return [];
        return [{ scale: this.staticAnimation }];
    }

    getTransform = () => {
        const movementTransform = this.getMovementTransform();
        const staticTransform = this.getStaticTransform();

        const transform = [].concat(movementTransform, staticTransform);

        return { transform };
    }

    render = () => {
        const { children, style } = this.props;

        const viewStyles = [ style, this.getTransform(), this.getOpacity() ];

        return (
            <Animated.View style={viewStyles}>
                {children}
            </Animated.View>
        );
    }
}