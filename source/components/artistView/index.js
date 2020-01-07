import React, { useContext } from "react";
import SearchResultContext from '../ccontexts/searchResultContext';

import { Card, Col, Row, Skeleton } from 'antd';


function ArtistPreview({artistId}) {

    const searchResultContext = useContext(SearchResultContext);

    console.log(searchResultContext);
  
    return (
        <div>
            <Row gutter={16} layout="flex" justify="space-between">
                <Col
                    xs={{ span: 24 }}
                    sm={{ span: 24 }}
                    md={{ span: 24 }}
                    lg={{ span: 3 }}
                    xl={{ span: 3 }}
                    xxl={{ span: 3 }}
                >
                {
                    !searchResultContext.artists 
                        ? "EMPTY"
                        : <Card size="small" bordered={false} cover={<img alt="example" src={searchResultContext.artists[0].items[0].images[0].url}/>}>
                            some filler data
                        </Card>
                }
                    
                </Col>
            </Row>

            <Row gutter={16} layout="flex" justify="space-between">
                <Col
                    xs={{ span: 24 }}
                    sm={{ span: 24 }}
                    md={{ span: 24 }}
                    lg={{ span: 3 }}
                    xl={{ span: 3 }}
                    xxl={{ span: 3 }}
                >
                    <Card size="small" title="Top Tracks" bordered={false}>
                        <Skeleton
                            active
                            loading={true}
                            paragraph={{ rows: 5 }}
                        />
                    </Card>
                </Col>

                <Col
                    xs={{ span: 24 }}
                    sm={{ span: 24 }}
                    md={{ span: 24 }}
                    lg={{ span: 3 }}
                    xl={{ span: 3 }}
                    xxl={{ span: 3 }}
                >
                    <Card size="small" title="Albums" bordered={false}>
                        <Skeleton
                            active
                            loading={true}
                            paragraph={{ rows: 5 }}
                        />
                    </Card>
                </Col>
            </Row>

            <div style={{ backgroundColor: "red", height: 20, width: "100%" }}></div>
        </div>
    )
}


export default search;