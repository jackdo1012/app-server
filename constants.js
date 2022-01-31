module.exports = {
    imgTypeSupported: {
        jpg: "ffd8ffe0",
        jpeg: "ffd8ffe1",
        png: "89504e47",
    },
    serverError: (res, message = "") => {
        return res
            .status(500)
            .json({ success: false, message: "Server error: " + message });
    },
    newCommentResponse: (user, comment) => {
        return {
            title: `Your get has a new comment from ${user}`,
            body: comment,
        };
    },
    newFollowResponse: (user) => {
        return {
            title: "You have a new follower",
            body: `${user} just followed you.`,
        };
    },
    newPostResponse: (user, postBody) => {
        return {
            title: `${user} has a new post`,
            body: `${postBody}`,
        };
    },
};
