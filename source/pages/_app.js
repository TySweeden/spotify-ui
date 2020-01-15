//import 'antd/dist/antd.less';
import '../static/css/style.css';
import '../static/css/style.less';
import ls from 'local-storage'
import uuidv1 from 'uuid/v1';
import App, { Container } from 'next/app'
import Head from 'next/head';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from '@apollo/react-hooks';
import { WebSocketLink } from 'apollo-link-ws';
import { HttpLink } from 'apollo-link-http';
import { split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';

import {
    Layout,
    Menu,
    Icon,
    Spin,
    BackTop
} from 'antd';
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'

const { Header, Content, Footer, Sider } = Layout;
const { SubMenu } = Menu;

import Link from 'next/link';
import ConfigContext from '../contexts/ConfigContext';
import { LoadConfig } from '../actions/ConfigActions';

import MainContainer from '../components/mainContainer';

import reactIcon from "../resources/icons/react-icon.svg"
import graphqlIcon from "../resources/icons/graphql-icon.svg"
import spotifyIcon from "../resources/icons/spotify-icon.svg"

const determinePageSize = (height, width) => {
    var pageSize = 'lg';

    if (width <= 576)
        pageSize = 'xs';
    else if (width > 576 && width <= 768)
        pageSize = 'sm';
    else if (width > 768 && width <= 992)
        pageSize = 'md';
    else if (width > 992 && width <= 1200)
        pageSize = 'lg';
    else if (width > 1200 && width < 1600)
        pageSize = 'xl';
    else if (width > 1600)
        pageSize = 'xxl';

    return pageSize;
}

function InitApp(props) {
    const { Component, pageProps } = props;
    const router = useRouter()
    const [pageSize, setPageSize] = useState();
    const [clientIdentifier, setClientIdentifier] = useState();
    const [configuration, setConfiguration] = useState();
    const [apolloClient, setApolloClient] = useState();

    const getPageSize = () => {
        console.log("getPageSize")
        setPageSize(determinePageSize(window.innerHeight, window.innerWidth));

        window.onresize = () => {
            setPageSize(determinePageSize(window.innerHeight, window.innerWidth));
        }
    }

    const getClientIdentifier = () => {
        var uuid = ls.get('client-identifier');

        if (_.isUndefined(uuid) || _.isNull(uuid) || _.isNaN(uuid)) {
            ls.set('client-identifier', uuidv1());
            uuid = ls.get('client-identifier');
        }

        setClientIdentifier(uuid);
    }

    const getConfig = () => {
        LoadConfig().then(config => setConfiguration(config));
    }

    const getApolloClient = () => {
        if (!configuration || apolloClient) return;

        const token = ls.get('infor-token');

        const httpLink = new HttpLink({
            uri: configuration.graphqlEndpoint, // use https for secure endpoint
            headers: {
                authorization: token ? `Bearer ${token}` : '',
                'access-token': token ? `${token}` : '',
                'x-hasura-admin-secret': configuration.husuraAccessToken
            }
        });

        const wsLink = new WebSocketLink({
            uri: configuration.graphqlWsEndpoint,
            options: {
                reconnect: true,
                lazy: true,
                connectionParams: {
                    headers: {
                        authorization: token ? `Bearer ${token}` : '',
                        'access-token': token ? `${token}` : '',
                        'x-hasura-admin-secret': configuration.husuraAccessToken
                    }
                }
            }
        });

        // using the ability to split links, you can send data to each link
        // depending on what kind of operation is being sent
        const link = split(
            // split based on operation type
            ({ query }) => {
                const { kind, operation } = getMainDefinition(query);
                return kind === 'OperationDefinition' && operation === 'subscription';
            },
            wsLink,
            httpLink
        );

        var client = new ApolloClient({
            link,
            //uri: configuration.graphqlEndpoint,
            request: operation => {
                const token = ls.get('infor-token');
                operation.setContext({
                    headers: {
                        authorization: token ? `Bearer ${token}` : '',
                        'access-token': token ? `${token}` : ''
                    }
                });
            },
            cache: new InMemoryCache()
        });

        setApolloClient(client);
    }


    useEffect(getClientIdentifier, []);
    useEffect(getConfig, []);
    useEffect(getApolloClient, [configuration]);
    useEffect(getPageSize, [pageSize]);

    let maxHeight = "100vh";
    maxHeight = pageSize ? pageSize === "xxl" ? "90vh" : maxHeight : maxHeight;

    return (
        <Spin size="large" className="main-spinner" spinning={!configuration || !apolloClient}>

        <BackTop />
            {!configuration || !apolloClient ? <span style={{ position: "fixed", right: 6, bottom: 6, fontWeight: 600 }}>CONNECTING...</span> :
                <ConfigContext.Provider value={{ clientIdentifier, configuration, pageAttributes: { pageSize } }}>
                    <ApolloProvider client={apolloClient}>
                        <Layout style={{ display: "flex", minHeight: '100vh' }}>

                            {/*pageSize === "lg" || pageSize === "xl" || pageSize === "xxl" 
                            ? <Header style={{ background: '#fff', padding: 0 }}/>
                            : null*/}

                            <Header className="header" style={{ padding: 0, marginBottom: 8 }}>
                                <div className="logo" />

                            </Header>

                            <Content>
                                <div id="top"></div>
                                <MainContainer>
                                    <Component {...pageProps} />
                                </MainContainer>
                            </Content>



                            <div className="main-nav-menu">
                                <Menu 
                                    size="small" 
                                    mode="horizontal" 
                                    defaultSelectedKeys={
                                        router.pathname === "/"
                                        ? ['1']
                                        : _.includes(router.pathname, "/search") 
                                            ? ['2']
                                            : _.includes(router.pathname, "/playlist") 
                                                ? ['3']
                                                : ['2']
                                    } 
                                    subMenuCloseDelay={1} 
                                    subMenuOpenDelay={1}>
                                    <Menu.Item key="1">
                                        <Link href="/">
                                            <span>
                                                <Icon type="home" style={{ fontSize: "1.4em" }} />
                                                <span>Home</span>
                                            </span>
                                        </Link>
                                    </Menu.Item>

                                    <Menu.Item key="2">
                                        <Link href="/search">
                                            <span>
                                                <Icon type="search" style={{ fontSize: "1.4em" }} />
                                                <span>Search</span>
                                            </span>
                                        </Link>
                                    </Menu.Item>

                                    <Menu.Item key="3">
                                        <Link href="/view/playlist">
                                            <span>
                                                <Icon type="smile" style={{ fontSize: "1.4em" }} />
                                                <span>Playlist</span>
                                            </span>
                                        </Link>
                                    </Menu.Item>
                                </Menu>
                            </div>

                            <Footer style={{ position: "absolute", bottom: 0, left: 0, right: 0 }} >
                                <div style={{ float: "right" }}>
                                    <Icon component={reactIcon} />
                                    <Icon component={graphqlIcon} />
                                    <Icon component={spotifyIcon} />
                                </div>
                            </Footer>

                        </Layout>
                    </ApolloProvider>
                </ConfigContext.Provider>}
        </Spin>
    )
}

export default class MyApp extends App {

    render() {
        const { Component, err, pageProps, router } = this.props;

        return (
            <Container>
                <Head>
                    <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                    {/*<script type="text/javascript" charset="utf-8" src="../static/js/ebapi-modules.js"></script>*/}
                </Head>
                <InitApp Component={Component} err={err} pageProps={pageProps} router={router} />
            </Container>
        )
    }
}










/*<Sider collapsible breakpoint="lg"
                        collapsedWidth="0"
                        collapsed={this.state.collapsed}
                        onCollapse={this.onCollapse}>
                        <div style={{ height: 36, background: "rgba(255, 255, 255, 0.2)", margin: 16}}/>
                        <Menu theme="dark" openKeys={['sub2']} defaultSelectedKeys={['6']} mode="inline" subMenuCloseDelay={1} subMenuOpenDelay={1}>
                            <Menu.Item key="1">
                                <Link href="/">
                                    <span>
                                        <Icon type="pie-chart" style={{ fontSize:"1.4em" }}/>
                                        <span>Option 1</span>
                                    </span>
                                </Link>
                            </Menu.Item>

                            <Menu.Item key="2">
                                <Link href="/">
                                    <span>
                                        <Icon type="desktop" style={{ fontSize:"1.4em" }}/>
                                        <span>Option 2</span>
                                    </span>
                                </Link>
                            </Menu.Item>
                            <SubMenu key="sub1"
                                title={
                                <span>
                                    <Icon type="user" style={{ fontSize:"1.4em" }}/>
                                    <span>User</span>
                                </span>
                                }>
                                <Menu.Item key="3">Tom</Menu.Item>
                                <Menu.Item key="4">Bill</Menu.Item>
                                <Menu.Item key="5">Alex</Menu.Item>
                            </SubMenu>
                            <SubMenu key="sub2"
                                title={
                                <span>
                                    <Icon type="api" style={{ fontSize:"1.4em" }}/>
                                    <span>Endpoints</span>
                                </span>
                                }>
                                <Menu.Item key="6">
                                    <Link href="/receiving">
                                        <a>Receive</a>
                                    </Link>
                                </Menu.Item>
                                <Menu.Item key="8">endpoint 2</Menu.Item>
                            </SubMenu>
                        </Menu>
                            </Sider>*/