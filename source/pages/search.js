import React, { useContext, useEffect, useState } from "react";
import SearchResultContext from '../contexts/searchResultContext';
import _ from 'lodash';
import Link from 'next/link';
import Router from 'next/router'
import { Card, List, Avatar, Icon, Empty, Button, Col, Row, Skeleton } from 'antd';

//searchResultContext.artists.loading || !(searchResultContext.artists.data || searchResultContext.albums.data || searchResultContext.tracks.data)

function search() {
    const [loading, setLoading] = useState(false);
    const searchResultContext = useContext(SearchResultContext);

    useEffect(() => {
        !loading && searchResultContext.loading && !(searchResultContext.artists.data || searchResultContext.albums.data || searchResultContext.tracks.data)
            ? setLoading(true)
            : loading && !searchResultContext.loading && searchResultContext.artists.data && searchResultContext.albums.data && searchResultContext.tracks.data
                ? setLoading(false)
                : null;
    });

    const viewArtist = (artistId) => {

    }

    const viewAlbum = (albumId) => {

    }

    return (
        <Row gutter={16} layout="flex" justify="space-between" style={{zIndex:1}}>
            <Col
                xs={{ span: 24 }}
                sm={{ span: 24 }}
                md={{ span: 24 }}
                lg={{ span: 15 }}
                xl={{ span: 16 }}
                xxl={{ span: 18 }}
            >
                <Card size="large" bordered={false} className="search-result-card">
                    <List
                        grid={{
                            gutter: 4,
                            xs: 1,
                            sm: 1,
                            md: 2,
                            lg: 2,
                            xl: 3,
                            xxl: 4
                        }}
                        loading={loading}
                        itemLayout="horizontal"
                        dataSource={searchResultContext.artists.data && searchResultContext.albums.data && searchResultContext.tracks.data
                            ? _.concat(...searchResultContext.artists.data.items, ...searchResultContext.albums.data.items, ...searchResultContext.tracks.data.items)
                            : []
                        }
                        renderItem={item => (
                            <List.Item key={item.id}>
                                <div className="search-result-item">
                                    <Skeleton avatar={{ shape: "square", size: 80 }} title={true} loading={loading} active paragraph={{ rows: 1 }}>
                                        <Link href={
                                            item.type === "artist" 
                                                ? `/view/artist?id=${item.id}` 
                                                : item.type === "album" 
                                                    ? `/view/album?id=${item.id}` 
                                                    : item.type === "track"
                                                        ? `/view/album?id=${item.album.id}&trackId=${item.id}` 
                                                        : "#"}>
                                            <div className="search-result-item-meta">
                                                <List.Item.Meta
                                                    avatar={_.get(_.head(item.images), "url")
                                                        ? <Avatar size={80} shape="square" src={_.get(_.head(item.images), "url")} />
                                                        : item.type === "track" && _.get(item, "album")
                                                            ? <Avatar size={80} shape="square" src={_.get(_.head(item.album.images), "url")} />
                                                            : <Avatar size={80} shape="square" icon="user" />}
                                                    title={item.name}
                                                    description={
                                                        item.type === "album" && _.get(item, "artists")
                                                            ? item.type + " • " + _.join(_.map(item.artists, "name"), " • ")
                                                            : item.type === "track" && _.get(item, "album")
                                                                ? item.type + " • " + _.join(_.map(item.album.artists, "name"), " • ")
                                                                : item.type
                                                    }
                                                />
                                                <Icon type="right" />
                                            </div>
                                        </Link>
                                    </Skeleton>
                                </div>
                            </List.Item>
                        )}
                    />

                </Card>
            </Col>
            <Col
                xs={{ span: 24 }}
                sm={{ span: 24 }}
                md={{ span: 24 }}
                lg={{ span: 5 }}
                xl={{ span: 5 }}
                xxl={{ span: 5 }}
            >
                <Card size="large" bordered={false}>
                    <List
                        itemLayout="horizontal"
                        dataSource={["See all artists", "See all albums", "See all tracks"]}
                        renderItem={item => (
                            <List.Item className="search-query-links">
                                {<div style={{ fontWeight: 500, width: "100%", margin: "0 6px", lineHeight: 1, color: "rgba(255, 255, 255, 0.65)" }}>{item}<Icon type="right" style={{ float: "right" }} /></div>}
                                {/*<Button style={{fontWeight:500, width:"100%", lineHeight:1, textAlign:"left"}}> {item} <Icon type="right" style={{float:"right"}} /> </Button>*/}
                            </List.Item>
                        )}>
                    </List>
                </Card>
            </Col>
        </Row>
    )
}


export default search;