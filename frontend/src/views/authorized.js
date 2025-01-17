import React, { useRef, useState } from 'react';
import { Redirect } from '@reach/router';
import { connect } from 'react-redux';
import { setAuthDetails } from '../store/actions/auth';

const useComponentWillMount = (fn) => {
  const willMount = useRef(true);
  if (willMount.current) {
    fn();
  }
  willMount.current = false;
};

function AuthorizedView(props) {
  const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);
  const params = new URLSearchParams(props.location.search);

  useComponentWillMount(() => {
    let authCode = params.get('code');
    let state = params.get('state');
    if (authCode !== null) {
      window.opener.authComplete(authCode, state);
      window.close();
      return;
    }
    const username = params.get('username');
    const sessionToken = params.get('session_token');
    const osm_oauth_token = params.get('osm_oauth_token');
    props.authenticateUser(username, sessionToken, osm_oauth_token);
    setIsReadyToRedirect(true);
  });

  const redirectUrl =
    params.get('redirect_to') && params.get('redirect_to') !== '/'
      ? params.get('redirect_to')
      : '/welcome';

  return <>{isReadyToRedirect ? <Redirect to={redirectUrl} noThrow /> : <div>redirecting</div>}</>;
}

let mapStateToProps = (state, props) => ({
  location: props.location,
});

const mapDispatchToProps = (dispatch) => {
  return {
    authenticateUser: (username, token, osm_oauth_token) =>
      dispatch(setAuthDetails(username, token, osm_oauth_token)),
  };
};

const Authorized = connect(mapStateToProps, mapDispatchToProps)(AuthorizedView);
export { Authorized };
