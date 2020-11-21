export class Constants {
    public static PageQueryParamKey = "page";
    public static PageLimitQueryParamKey = "limit";
    public static PaginationRoute = "pages";

    public static FilterQueryParamKey = "filter";

    public static MediaConstraints: MediaStreamConstraints = <MediaStreamConstraints> {
        video: true,
        audio: true
    };
}