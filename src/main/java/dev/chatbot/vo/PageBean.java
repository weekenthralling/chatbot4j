package dev.chatbot.vo;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

/**
 * @author zhoumo
 * @param <T>
 */
@Data
@NoArgsConstructor
public class PageBean<T> {

    /**
     * 页号
     */
    @JsonProperty("current")
    private Integer pageNo;

    /**
     * 分页大小
     */
    private Integer pageSize;

    /**
     * 总数
     */
    private Long total;

    /**
     * 列表信息
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
     * 返回空列表
     */
    public static <T> PageBean<T> emptyPage(Integer pageNo, Integer pageSize){
        return new PageBean<>(pageNo, pageSize, 0L, Collections.emptyList());
    }
}
