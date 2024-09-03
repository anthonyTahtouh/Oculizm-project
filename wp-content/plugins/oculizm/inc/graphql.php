<?php


// https://app.oculizm.com/graphql?query=query{posts{nodes{id%20title}}}

// https://app.oculizm.com/graphql?query={posts(first:32,where:{clientId:"18852"}){nodes{clientId%20postFields{fieldGroupName%20galleries%20imageAltText%20isVideo%20matchedProducts{gbLink%20gbPrice%20gbTitle%20productId%20productName%20productPrice%20productUrl%20sku%20x%20y}socialNetwork%20sourceUrl}}}}

add_action('graphql_register_types', 'graphql_register_types');
function graphql_register_types() {

    // Client ID
    register_graphql_field('Post', 'clientId', [
        'description' => 'The clientId of the post object',
        'type' => 'String',
        'resolve' => function(\WPGraphQL\Model\Post $post) {
            return get_post_meta($post->databaseId, 'client_id', true);
        }
    ]);
    register_graphql_field('RootQueryToPostConnectionWhereArgs', 'clientId', [
        'type' => 'String',
        'description' => 'Query posts by client ID',
    ]);

    // first matched product ID
    register_graphql_field('Post', 'mpid1', [
        'description' => 'The ID of the first matched product of the post object',
        'type' => 'String',
        'resolve' => function(\WPGraphQL\Model\Post $post) {
            return get_post_meta($post->databaseId, 'matched_products_0_product_id', true);
        }
    ]);
    register_graphql_field('RootQueryToPostConnectionWhereArgs', 'mpid1', [
        'type' => 'String',
        'description' => 'Query posts by first matched product ID',
    ]);
}


add_filter('graphql_post_object_connection_query_args', function ($query_args, $source, $args, $context, $info) {

    // Client ID
    if (isset($args['where']['clientId'])) {
        $query_args['meta_query'] = [
            [
                'key' => 'client_id',
                'value' => $args['where']['clientId'],
                'compare' => '='
            ]
        ];
    }
    
    // first matched product ID
    // if (isset($args['where']['mpid1'])) {
    //     $query_args['meta_query'] = [
    //         [
    //             'key' => 'matched_products_0_product_id',
    //             'value' => $args['where']['mpid1'],
    //             'compare' => '='
    //         ]
    //     ];
    // }

    if (isset($args['where']['mpid1'])) {
        $productIds = explode(',', $args['where']['mpid1']);
        $query_args['meta_query'] = [
            [
                'key' => 'matched_products_0_product_id',
                'value' => $productIds,
                'compare' => 'IN'
            ]
        ];
    }
    
    // WE MIGHT NEED ONE CONDITIONAL BLOCK HERE TESTING FOR BOTH PARAMS

    // // Matched Products
    // if (isset($args['where']['matchedProducts'])) {
    //     $query_args['meta_query'] = [
    //         [
    //             'key' => 'matched_products',
    //             'value' => $args['where']['matchedProducts'],
    //             'compare' => 'LIKE'
    //         ]
    //     ];
    // }

    return $query_args;
}, 10, 5);




