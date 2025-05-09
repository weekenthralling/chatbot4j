package dev.chatbot.vo;

import java.util.Collections;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PageBean is a generic class that represents a paginated response.
 * It contains information about the current page number, page size,
 * total number of items, and a list of items for the current page.
 *
 * @author zhoumo
 * @param <T>
 */
@Data
@NoArgsConstructor
public class PageBean<T> {

    /**
     * page number
     */
    @JsonProperty("current")
    private Integer pageNo;

    /**
     * page size
     */
    private Integer pageSize;

    /**
     * total number of items
     */
    private Long total;

    /**
     * items for the current page
     */
    private List<T> list;

    public PageBean(Integer pageNo, Integer pageSize, Long total, List<T> list) {
        this.pageNo = pageNo;
        this.pageSize = pageSize;
        this.total = total;
        this.list = list;
    }

    public static <T> PageBean<T> of(Integer pageNo, Integer pageSize, Long total, List<T> list) {
        return new PageBean<>(pageNo, pageSize, total, list);
    }

    /**
     * return an empty page bean
     */
    public static <T> PageBean<T> emptyPage(Integer pageNo, Integer pageSize) {
        return new PageBean<>(pageNo, pageSize, 0L, Collections.emptyList());
    }
}
