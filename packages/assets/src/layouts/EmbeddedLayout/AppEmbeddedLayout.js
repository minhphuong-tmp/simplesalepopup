import React from 'react';
import { Frame, Loading, Toast } from '@shopify/polaris';
import { NavMenu } from '@shopify/app-bridge-react';
import PropTypes from 'prop-types';
import { useStore } from '@assets/reducers/storeReducer';
import { closeToast } from '@assets/actions/storeActions';
import { routePrefix } from '@assets/config/app';

/**
 * Embedded app layout with App Bridge NavMenu for Shopify Admin sidebar navigation
 *
 * @param children
 * @returns {JSX.Element}
 * @constructor
 */
function AppEmbeddedLayout({ children }) {
  const { state, dispatch } = useStore();
  const { loading, toast } = state;
  const prefix = routePrefix;

  return (
    <Frame>
      <NavMenu>
        <a href={prefix + '/'} rel="home">Home</a>
        <a href={prefix + '/notifications'}>Notifications</a>
      </NavMenu>
      {children}
      {loading && <Loading />}
      {toast && <Toast onDismiss={() => closeToast(dispatch)} {...toast} />}
    </Frame>
  );
}

AppEmbeddedLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default AppEmbeddedLayout;
