import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { useCollectionOnce } from 'react-firebase-hooks/firestore';
import { firebase } from '../firebase';

const FeatureFlagsContext = createContext({});

export default function FeatureFlags ({ children, featureFlags }) {
  return (
    <FeatureFlagsContext.Provider value={ featureFlags }>
      { children }
    </FeatureFlagsContext.Provider>
  );
}
FeatureFlags.propTypes = {
  children: PropTypes.oneOfType([ PropTypes.func, PropTypes.node ]),
  featureFlags: PropTypes.object,
};

export function Feature ({
  children,             // Will be rendered only when expectation is set to TRUE.
  name,                 // Name of feature flag.
  expectation = true,   // An optional boolean that causes component to render or not render.
  flagIsTrueComponent,  // An optional prop that may be used instead of children when expectation is set to TRUE.
  flagIsFalseComponent, // An optional prop to show instead of children or flagIsTrueComponent when expectation is set to FALSE.
}) {
  const featureFlags = useContext(FeatureFlagsContext);

  /**
   * Show children only if the feature flag matches the expectation, or
   * if expectation is set to false and the feature flag does not exist.
   */
  if (
    name && (
      (featureFlags[name] === expectation) ||
      (featureFlags.hasOwnProperty(name) === false && expectation === false)
    )
  ) {
    if (children) {
      return children;
    } else if (flagIsTrueComponent) {
      return propRender(flagIsTrueComponent);
    } else {
      return null;
    }
  } else if (flagIsFalseComponent) {
    return propRender(flagIsFalseComponent);
  } else {
    return null;
  }
}
Feature.propTypes = {
  children: PropTypes.oneOfType([ PropTypes.func, PropTypes.node ]),
  expectation: PropTypes.bool,
  flagIsFalseComponent: PropTypes.oneOfType([ PropTypes.func, PropTypes.node ]),
  flagIsTrueComponent: PropTypes.oneOfType([ PropTypes.func, PropTypes.node ]),
  name: PropTypes.string.isRequired,
};

export function FeatureFlagsFirebaseContainer ({ children }) {
  const [snapshot, loading, error] = useCollectionOnce(
    firebase.firestore().collection(`featureFlags`)
  );

  if (error) {
    console.error(error);
  }

  if (loading) {
    return null;
  }

  const featureFlags = {};

  if (snapshot) {
    snapshot.docs.forEach(doc => {
      const { enabled } = doc.data();
      featureFlags[doc.id] = enabled;
    });
  }

  return <FeatureFlags featureFlags={ featureFlags }>{ children }</FeatureFlags>;
}
FeatureFlagsFirebaseContainer.propTypes = {
  children: PropTypes.oneOfType([ PropTypes.func, PropTypes.node ]),
};

export const withFeature = (WrappedComponent, name) => (props) => {
  const featureFlags = useContext(FeatureFlagsContext);
    const newProps = {...props};

    if (name) {
      newProps[name] = featureFlags[name];
    }
    else {
      newProps.featureFlags = featureFlags;
    }

    return <WrappedComponent {...newProps} />;
};

function propRender (prop) {
  if (typeof prop === 'function') {
    // Prop is a Component, so render it.
    const Component = prop;
    return <Component />;
  }

  // Prop is not a Component, perhaps just jsx, or a string, or a number.
  return prop;
}
